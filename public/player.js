let temp_arr = window.location.pathname.split("/");
let roomno = temp_arr[temp_arr.length - 1];
let arr = [];
let current_username = new URLSearchParams(window.location.search).get(
	"username"
);
let room_URL = `https://sync-player666.herokuapp.com/room/${roomno}`;

let spanEle = document.getElementById("roomNo");
spanEle.innerText += roomno;
document.getElementById("userDetail").innerText += current_username;

const socket = io();

//Asking permission to enter the room
socket.emit("ask permission", roomno, current_username);

// Room does not exist
socket.on("room does not exist", () => {
	window.location.href = "https://sync-player666.herokuapp.com";
});

// Listenting for host reply
socket.on("enter room", (isAllowed) => {
	// allowed to enter the room
	if (isAllowed) socket.emit("joinroom", roomno, current_username);
	// not allowed to enter the room
	else window.location.href = "https://sync-player666.herokuapp.com";
});

// For host to allow a user
socket.on("user permission", (username, socketId) => {
	console.log(socketId + " asking permission");
	socket.emit("isAllowed", true, socketId);
});

// const video = document.getElementById("video");
const slider = document.getElementById("custom-seekbar");

function copyLink() {
	console.log(room_URL);
	let para = document.createElement("textarea");
	para.id = "copiedLink";
	para.value = room_URL;
	document.body.appendChild(para);
	let ele = document.getElementById("copiedLink");
	ele.select();
	document.execCommand("copy");
	document.body.removeChild(para);
}

let URL = window.URL || window.webkitURL;
const displayMessage = function (message, isError) {
	let element = document.getElementById("message");
	element.innerHTML = message;
	element.className = isError ? "error" : "info";
};
const video = new Plyr("#video");

const playSelectedFile = function (event) {
	let file = this.files[0];
	let fileURL = URL.createObjectURL(file);
	video.source = {
		type: "video",
		title: "Example title",
		sources: [
			{
				src: fileURL,
				type: file.type,
				size: 720,
			},
		],
	};
};

let inputNode = document.getElementById("input");
inputNode.addEventListener("change", playSelectedFile, false);

// video.ontimeupdate = function () {
// 	var percentage = (video.currentTime / video.duration) * 100;
// 	$("#custom-seekbar span").css("width", percentage + "%");
// 	socket.emit("update", percentage, roomno);
// };

// $("#custom-seekbar").on("click", function (e) {
// 	var offset = $(this).offset();
// 	var left = e.pageX - offset.left;
// 	var totalWidth = $("#custom-seekbar").width();
// 	var percentage = left / totalWidth;
// 	var vidTime = video.duration * percentage;
// 	video.currentTime = vidTime;
// 	playVideo();
// });

// play event added
// function playVideo() {
// 	socket.emit("play", roomno);
// 	video.play();
// 	let fraction = video.currentTime / video.duration;
// 	video.currentTime = video.duration * fraction;
// 	socket.emit("slider", video.currentTime, roomno);
// }

// // pause event handled
// function pauseVideo() {
// 	socket.emit("pause", roomno);
// 	video.pause();
// }

let canSeek = true;
//play event handled
video.on("playing", (event) => {
	console.log("video playing");
	socket.emit("play", roomno);
	if (canSeek) socket.emit("seeked", video.currentTime, roomno);
});

// pause event handled
video.on("pause", (event) => {
	console.log("video paused");
	socket.emit("pause", roomno);
});

// seeking event handled
video.on("seeked", (event) => {
	console.log("video seeked");
	if (canSeek) {
		console.log("1st seek happened");
		socket.emit("seeked", video.currentTime, roomno);
	}
});

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
	canSeek = false;
	console.log("listening seeking event and canSeek " + canSeek);
	video.currentTime = data;
	setTimeout(() => {
		canSeek = true;
		console.log("after 5sec canSeek " + canSeek);
	}, 1000);
});

socket.on("slider", (data) => {
	video.currentTime = data;
});

socket.on("new user", (username) => {
	Notification.requestPermission().then(function () {
		new Notification(`${username} joined the room`);
	});
});

socket.on("left room", (username) => {
	Notification.requestPermission().then(function () {
		new Notification(`${username} left the room`);
	});
});

socket.on("user_array", (user_array) => {
	// Getting the array of users in room
	document.getElementById("no_of_members").innerText = user_array.length;
	let z = document.getElementById("sidePanel");
	z.innerHTML = "";
	let h = document.createElement("h3");
	let txt = document.createTextNode("Connected Users:");
	h.appendChild(txt);
	z.appendChild(h);
	for (var i = 0; i < user_array.length; i++) {
		let para = document.createElement("p");
		let node = document.createTextNode(user_array[i]);
		para.appendChild(node);
		z.appendChild(para);
	}
	console.log(user_array);
});
