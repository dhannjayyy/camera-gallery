let db;

let dbOpenRequest = indexedDB.open("Gallery");

dbOpenRequest.onsuccess = ((e)=>{
    db = e.target.result;
})

dbOpenRequest.onerror = ((error)=>{
    console.log("error",error.message);
})

dbOpenRequest.onupgradeneeded = ((e)=>{
    db = e.target.result;
    db.createObjectStore("video",{autoIncrement:true});
    db.createObjectStore("image",{autoIncrement:true});
})