let backBtn = document.querySelector(".back");
let galleryCont = document.querySelector(".gallery-cont");

backBtn.addEventListener("click", () => {
  location.assign("./index.html");
});

//if we are connected to db -> Only Then This Code Will Be Executed
setTimeout(() => {
  if (db) {
    //display images
    let imageDBTransaction = db.transaction("image", "readonly");
    let imageStore = imageDBTransaction.objectStore("image");

    let imageRequest = imageStore.getAll();

    imageRequest.onsuccess = function () {
      if (imageRequest.result !== undefined) {
        // console.log("Images", imageRequest.result);

        let imageResult = imageRequest.result;

        imageResult.forEach((imageObj) => {
          // console.log(imageObj);

          let imageurl = imageObj.url;

          //create an image container
          let imageEle = document.createElement("div");
          imageEle.setAttribute("class", "media-cont");
          imageEle.setAttribute("id", imageObj.id);
          //add image to that cont
          imageEle.innerHTML = `
        <div class="media">
          <img src="${imageurl}"/>
        </div>
        <div class="download action-btn">DOWNLOAD </div>
        <div class="delete action-btn">DELETE </div>
      `;
          //appendchild in gallery cont
          galleryCont.appendChild(imageEle);

          let deleteBtn = imageEle.querySelector(".delete");
          deleteBtn.addEventListener("click", deleteListener);

          let downloadBtn = imageEle.querySelector(".download");
          downloadBtn.addEventListener("click", downloadListener);
        });
      } else {
        console.log("No Such Images");
      }
    };
  }

  // display videos
  let videoDBTransaction = db.transaction("video", "readonly");
  let videoStore = videoDBTransaction.objectStore("video");
  let videoRequest = videoStore.getAll();

  videoRequest.onsuccess = function () {
    let videoResult = videoRequest.result;

    videoResult.forEach((videoObj) => {
      let videoElem = document.createElement("div");
      videoElem.setAttribute("class", "media-cont");
      videoElem.setAttribute("id", videoObj.id);

      let url = URL.createObjectURL(videoObj.blobData);

      videoElem.innerHTML = `
        <div class="media">
        <video autoplay muted src="${url}"/>
        </div>
        <div class="download action-btn">DOWNLOAD</div>
        <div class="delete action-btn">DELETE</div>

      `;
      galleryCont.appendChild(videoElem);

      let deleteBtn = videoElem.querySelector(".delete");
      deleteBtn.addEventListener("click", deleteListener);

      let downloadBtn = videoElem.querySelector(".download");
      downloadBtn.addEventListener("click", downloadListener);
    });
  };
}, 100);

let deleteListener = (e) => {
  //get id from e
  let id = e.target.parentElement.getAttribute("id");

  //find id belongs to which store
  let mediaType = id.split("-")[0];

  //go into the db of video / image
  // delete it

  if (mediaType == "img") {
    //delete image
    let imageDBTransaction = db.transaction("image", "readwrite");
    let imageStore = imageDBTransaction.objectStore("image");
    imageStore.delete(id);
  } else {
    //delete video
    let videoDBTransaction = db.transaction("video", "readwrite");
    let videoStore = videoDBTransaction.objectStore("video");
    videoStore.delete(id);
  }

  //delete from frontend
  e.target.parentElement.remove();
};

const downloadListener = (e) => {
  //get id from e
  let id = e.target.parentElement.getAttribute("id");

  //find id belongs to which store
  let mediaType = id.split("-")[0];

  // go into the db of video / image -> Download it
  if (mediaType == "img") {
    //Create DB Transaction and get the Image From DB
    let imageDBTransaction = db.transaction("image", "readonly");
    let imageStore = imageDBTransaction.objectStore("image");
    let imageRequest = imageStore.get(id);

    //Download The Image
    imageRequest.onsuccess = () => {
      let imageResult = imageRequest.result;
      let url = imageResult.url;
      let a = document.createElement("a");
      a.href = url;
      a.download = `${id}.jpeg`;
      // console.log();
      a.click();
      a.remove();
    };
  } else {
    //Create DB Transaction and get the Image From DB
    let videoDBTransaction = db.transaction("video", "readonly");
    let videoStore = videoDBTransaction.objectStore("video");
    let videoRequest = videoStore.get(id);

    //Download The Image
    videoRequest.onsuccess = () => {
      let videoResult = videoRequest.result;
      let url = URL.createObjectURL(videoResult.blobData);

      let a = document.createElement("a");
      a.href = url;
      a.download = `${id}.mp4`;
      a.click();
      a.remove();
    };
  }
};
