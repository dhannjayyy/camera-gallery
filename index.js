const videoRef = document.querySelector("video");
const recordBtn = document.querySelector(".record-btn");
const captureBtn = document.querySelector(".capture-btn");
const timerRef = document.querySelector(".timer-container");
const filters = document.querySelector(".filter-container");
const overlay = document.querySelector(".overlay");
let recordingState = false;
let recorder;
let streamChunks = [];
let counter = 0;
let timerId;
let filterColor = "transparent";

// hardware permission and recorder instance creator
(async function (constraints) {
  try {
    const streams = await navigator.mediaDevices.getUserMedia(constraints);
    videoRef.srcObject = streams;
    recorder = new MediaRecorder(streams);

    recorder.addEventListener("dataavailable", function (e) {
      streamChunks.push(e.data);
    });

    recorder.addEventListener("stop", function () {
      const blob = new Blob(streamChunks, { type: "video/mp4" });
      if (!db) return;
      const videoToStore = {
        video : blob,
      }
      const addVideoTransaction = db.transaction("video","readwrite")
      const objectStore = addVideoTransaction.objectStore("video")
      const request = objectStore.add(videoToStore)
      request.onsuccess = ((e)=>{
        let addedVideoId = e.target.result
        let addedVideo = objectStore.get(addedVideoId);
        addedVideo.onsuccess = (()=>{
          addedVideo = addedVideo.result;
          const customId = `vid-${e.target.result}`;
          const putRequest = objectStore.put({addedVideo,customId},customId);
          putRequest.onsuccess = (()=>{
            objectStore.delete(addedVideoId)
          })
        })
      })
      streamChunks = [];
    });
  } catch (error) {
    console.log(error.message);
  }
})({ video: true, audio: true });

//starts recording
recordBtn.addEventListener("click", function () {
  if (!recorder) return;
  recordingState = !recordingState;
  if (recordingState) {
    recorder.start();
    recordBtn.classList.add("record-animation");
    startTimer();
  } else {
    recorder.stop();
    recordBtn.classList.remove("record-animation");
    stopTimer();
  }
});

function startTimer() {
  timerRef.style.display = "block";
  function timer() {
    counter += 1;
    let totalSeconds = counter;

    let hour = Number.parseInt(totalSeconds / 3600);
    totalSeconds %= 3600;

    let minute = Number.parseInt(totalSeconds / 60);
    totalSeconds %= 60;

    let seconds = Number.parseInt(totalSeconds);
    hour = hour < 10 ? `0${hour}` : hour;
    minute = minute < 10 ? `0${minute}` : minute;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    let timerString = `${hour}:${minute}:${seconds}`;

    timerRef.innerText = timerString;
  }
  timerId = setInterval(timer, 1000);
}

function stopTimer() {
  counter = 0;
  clearInterval(timerId);
  timerRef.innerText = "00:00:00";
  timerRef.style.display = "none";
}

//filters and capturing logic
filters.addEventListener("click", (e) => {
  filterColor = getComputedStyle(e.target)["background-color"];
  overlay.style.backgroundColor = filterColor;
});

captureBtn.addEventListener("click", () => {
  captureBtn.classList.add("capture-animation");
  const canvas = document.createElement("canvas");
  canvas.height = videoRef.videoHeight;
  canvas.width = videoRef.videoWidth;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(videoRef,0,0,canvas.width,canvas.height);
  ctx.fillStyle = filterColor;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  canvas.toBlob((blobData)=>{
    const imageToStore = {
      image : blobData,
    }
    const addimageTransaction = db.transaction("image","readwrite")
    const objectStore = addimageTransaction.objectStore("image")
    const request = objectStore.add(imageToStore)
    request.onsuccess = ((e)=>{
      let addedImageId = e.target.result
      let addedImage = objectStore.get(addedImageId);
      addedImage.onsuccess = (()=>{
        addedImage = addedImage.result;
        const customId = `img-${e.target.result}`;
        const putRequest = objectStore.put({addedImage,customId},customId);
        putRequest.onsuccess = (()=>{
          objectStore.delete(addedImageId)
        })
      })
    })
  })

setTimeout(() => {
    captureBtn.classList.remove("capture-animation");
  }, 500);
});
