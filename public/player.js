let temp_arr = window.location.pathname.split("/");
let roomno = temp_arr[temp_arr.length - 1];
console.log(roomno);

const socket = io();
socket.emit("joinroom", roomno);

const video = document.getElementById("video");
const slider = document.getElementById("custom-seekbar");

let URL = window.URL || window.webkitURL;
const displayMessage = function (message, isError) {
  let element = document.getElementById("message");
  element.innerHTML = message;
  element.className = isError ? "error" : "info";
};

const playSelectedFile = function (event) {
  let file = this.files[0];
  let type = file.type;
  let videoNode = document.querySelector("video");
  let canPlay = videoNode.canPlayType(type);
  if (canPlay === "") canPlay = "no";
  let message = 'Can play type "' + type + '": ' + canPlay;
  let isError = canPlay === "no";
  displayMessage(message, isError);

  if (isError) {
    return;
  }

  let fileURL = URL.createObjectURL(file);
  videoNode.src = fileURL;
};

let inputNode = document.getElementById("input");
inputNode.addEventListener("change", playSelectedFile, false);

video.ontimeupdate = function () {
  var percentage = (video.currentTime / video.duration) * 100;
  $("#custom-seekbar span").css("width", percentage + "%");
  socket.emit("update", percentage, roomno);
};

$("#custom-seekbar").on("click", function (e) {
  var offset = $(this).offset();
  var left = e.pageX - offset.left;
  var totalWidth = $("#custom-seekbar").width();
  var percentage = left / totalWidth;
  var vidTime = video.duration * percentage;
  video.currentTime = vidTime;
  playVideo();
});

// play event added
function playVideo() {
  socket.emit("play", roomno);
  video.play();
  let fraction = video.currentTime / video.duration;
  video.currentTime = video.duration * fraction;
  socket.emit("slider", video.currentTime, roomno);
}

// pause event handled
function pauseVideo() {
  socket.emit("pause", roomno);
  video.pause();
}

//play event handled
video.onplaying = () => {
	socket.emit("play", roomno);
	socket.emit("seeked", video.currentTime, roomno);
}

// pause event handled
video.onpause = () => {
	socket.emit("pause", roomno);
}

// seeking event handled
video.onseeked = () => {
	socket.emit("seeked", video.currentTime, roomno);
}
// socket events handled
socket.on("update", (data) => {
  console.log("Recieved data", data);
  $("#custom-seekbar span").css("width", data + "%");
});

socket.on("play", () => {
  video.play();
});

socket.on("pause", () => {
  video.pause();
});

socket.on("seeked", (data) => {
	if( Math.abs(video.currentTime-data) > 1)
	{
		video.currentTime = data;
	}
})

socket.on("slider", (data) => {
  video.currentTime = data;
});
