var uid = new ShortUniqueId();
let recordBtnCont = document.querySelector(".record-btn-cont");
let recordBtn = document.querySelector(".record-btn");
let captureBtnCont = document.querySelector(".capture-btn-cont");
let captureBtn = document.querySelector(".capture-btn");
let timer = document.querySelector(".timer");
let gallery = document.querySelector(".gallery");
/**************************************** Recording Part Start ****************************************/
//start recording after clicking on record button
let mediaRecorder;
const constraints = {
  audio: true,
  video: true,
};

const chunks = [];

navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
  const video = document.querySelector("video");
  video.srcObject = stream;

  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.addEventListener("start", () => {
    // console.log("rec started");
    chunks = [];
  });

  mediaRecorder.addEventListener("dataavailable", (event) => {
    chunks.push(event.data); //single blob of video created and pushed into chunks array
  });

  mediaRecorder.addEventListener("stop", () => {
    let blob = new Blob(chunks, { type: "Video/mp4" });
    let videoURL = URL.createObjectURL(blob); //url of blob file will be created
    console.log(videoURL);
    console.log("rec stopped");

    //if we are connected to db -> Only Then This Code Will Be Executed
    if (db) {
      let videoId = uid();
      let dbTransaction = db.transaction("video", "readwrite");
      let videoStore = dbTransaction.objectStore("video");
      let videoEntry = {
        id: videoId,
        blobData: blob,
      };
      let addRequest = videoStore.add(videoEntry);

      addRequest.onsuccess = () => {
        console.log("Video Added To The VideoStore", addRequest.result);
      };
    }
  });
});

//record button
let isRecording = false;
recordBtnCont.addEventListener("click", () => {
  if (!isRecording) {
    //start recording
    startTimer();
    recordBtn.classList.add("scale-record");
    mediaRecorder.start();
    // timer.style.display = "block";
  } else {
    //stop recording
    stopTimer();
    recordBtn.classList.remove("scale-record");
    mediaRecorder.stop();
  }

  isRecording = !isRecording;
});

//make timer
let counter = 0;
let timerId;

function startTimer() {
  timer.style.display = "block";
  function displayTimer() {
    let totalSeconds = counter;

    let hours = Number.parseInt(totalSeconds / 3600);
    totalSeconds = totalSeconds % 3600;

    let minutes = Number.parseInt(totalSeconds / 60);
    totalSeconds = totalSeconds % 60;

    let seconds = totalSeconds;

    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    timer.innerHTML = `${hours}:${minutes}:${seconds}`;

    counter++;
  }

  timerId = setInterval(displayTimer, 1000);
}

function stopTimer() {
  clearInterval(timerId);
  timer.innerText = "00:00:00";
  timer.style.display = "none";
}
/**************************************** Recording Part End ****************************************/

/**************************************** Capturing Part Start ****************************************/

captureBtnCont.addEventListener("click", () => {
  const video = document.querySelector("video");
  captureBtn.classList.add("scale-capture");
  let canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  //applying filter on images
  ctx.fillStyle = filterColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let imageUrl = canvas.toDataURL("image/jpeg"); //Returns the content of the current canvas as an image that you can use as a source for another canvas or an HTML element.
  console.log("Photo Clicked");

  // //download image
  // let a = document.createElement("a");
  // a.href = image;
  // a.download = "myImage.jpeg";
  // a.click();

  if (db) {
    let imageId = uid();
    let dbTransaction = db.transaction("image", "readwrite");
    let imageStore = dbTransaction.objectStore("image");
    let imageEntry = {
      id: `img-${imageId}`,
      url: imageUrl,
    };

    let addRequest = imageStore.add(imageEntry);
    addRequest.onsuccess = () => {
      console.log("Image Entry Added to The Image Store", addRequest.result);
    };
  }

  //to make capture button active for next time
  setTimeout(function () {
    captureBtn.classList.remove("scale-capture");
  }, 1000);
});

//filter image
let allFilters = document.querySelectorAll(".filter"); //selects every filter class
let filterLayer = document.querySelector(".filter-layer");
let filterColor = "transparent";

allFilters.forEach((filteredEle) => {
  filteredEle.addEventListener("click", () => {
    //get css from the filtered ele
    filterColor = window
      .getComputedStyle(filteredEle)
      .getPropertyValue("background-color");

    //set background color of canvas acc to the filtercolor
    filterLayer.style.backgroundColor = filterColor;
  });
});

/**************************************** Capturing Part End ****************************************/

gallery.addEventListener("click", () => {
  location.assign("./gallery.html");
});
