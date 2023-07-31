const galleryContainer = document.querySelector(".gallery-container");

setTimeout(() => {
  const videoTransaction = db.transaction("video", "readonly");
  const videoObjectStore = videoTransaction.objectStore("video");

  const videoRequest = videoObjectStore.getAll();

  videoRequest.onsuccess = (e) => {
    const data = e.target.result;
    data.forEach((videoItem) => {
      const mediaCont = document.createElement("div");
      mediaCont.classList.add("media-container");
      mediaCont.setAttribute("data-id", videoItem.customId);
      const html = `<video src="${URL.createObjectURL(
        videoItem.addedVideo.video
      )}" autoplay loop> </video>
          <button class="actions-button download">Download</button>
          <button class="actions-button delete">Delete</button>`;
      mediaCont.innerHTML = html;
      galleryContainer.appendChild(mediaCont);
    });
  };

  videoRequest.onerror = (error) => {
    console.log(error.message);
  };

  const imageTransaction = db.transaction("image", "readonly");
  const imageObjectStore = imageTransaction.objectStore("image");

  const imageRequest = imageObjectStore.getAll();

  imageRequest.onsuccess = (e) => {
    const data = e.target.result;
    data.forEach((imageItem) => {
      const mediaCont = document.createElement("div");
      mediaCont.classList.add("media-container");
      mediaCont.setAttribute("data-id", imageItem.customId);
      const html = `<img src="${URL.createObjectURL(
        imageItem.addedImage.image
      )}" alt="image">
                <button class="actions-button download">Download</button>
                <button class="actions-button delete">Delete</button>`;
      mediaCont.innerHTML = html;
      galleryContainer.appendChild(mediaCont);
    });
  };
}, 50);

galleryContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("download")) {
      const mediaId = e.target.parentElement.getAttribute("data-id");
      donwloadHandler(mediaId);
    }
    if (e.target.classList.contains("delete")) {
        const mediaId = e.target.parentElement.getAttribute("data-id");
        deleteHandler(mediaId);
    }
});

donwloadHandler = (mediaId) => {
    console.log(mediaId)
    if(mediaId.includes("vid")){
        const videoTransaction = db.transaction("video", "readonly");
        const videoObjectStore = videoTransaction.objectStore("video");
        const request = videoObjectStore.get(mediaId);
        request.onsuccess = (e)=>{
            const video = e.target.result.addedVideo.video;
            const url = URL.createObjectURL(video);
            const a = document.createElement("a");
            a.href = url;
            a.download = "video.mp4";
            a.click();
        }
    }
    else if(mediaId.includes("img")){
        const imageTransaction = db.transaction("image", "readonly");
        const imageObjectStore = imageTransaction.objectStore("image");
        const request = imageObjectStore.get(mediaId);
        request.onsuccess = (e)=>{
            const image = e.target.result.addedImage.image;
            const url = URL.createObjectURL(image);
            const a = document.createElement("a");
            a.href = url;
            a.download = "image.jpg";
            a.click();
        }
    }
    deleteHandler(mediaId);
}

deleteHandler = (mediaId) => {
    if(mediaId.includes("vid")){
        const videoTransaction = db.transaction("video", "readwrite");
        const videoObjectStore = videoTransaction.objectStore("video");
        const request = videoObjectStore.delete(mediaId);
        request.onsuccess = (e)=>{
            const mediaCont = document.querySelector(`[data-id="${mediaId}"]`);
            mediaCont.remove();
        }
    }
    else if(mediaId.includes("img")){
        const imageTransaction = db.transaction("image", "readwrite");
        const imageObjectStore = imageTransaction.objectStore("image");
        const request = imageObjectStore.delete(mediaId);
        request.onsuccess = (e)=>{
            const mediaCont = document.querySelector(`[data-id="${mediaId}"]`);
            mediaCont.remove();
        }
    }
};
