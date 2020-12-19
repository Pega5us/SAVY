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

$(".toast").toast("show");

// Listenting for host reply
socket.on("enter room", (isAllowed) => {
	// allowed to enter the room
	if (isAllowed) socket.emit("joinroom", roomno, current_username);
	// not allowed to enter the room
	else window.location.href = "https://sync-player666.herokuapp.com";
});

// For host to allow a user
askingPermissionUsers = [];

document.getElementById("decline-btn").onclick = () => {
	socket.emit("isAllowed", false, askingPermissionUsers[0].socketId);
	askingPermissionUsers.splice(0, 1);
	if (askingPermissionUsers.length !== 0) {
		console.log("declined");
		setTimeout(() => {
			Utility();
		}, 500);
	}
};
document.getElementById("accept-btn").onclick = () => {
	socket.emit("isAllowed", true, askingPermissionUsers[0].socketId);
	askingPermissionUsers.splice(0, 1);
	if (askingPermissionUsers.length !== 0) {
		setTimeout(() => {
			Utility();
		}, 500);
		console.log("accepted");
	}
};

function Utility() {
	document.getElementById(
		"modal-body"
	).innerText = `${askingPermissionUsers[0].username} wants to join the room`;

	$("#exampleModal").modal({
		backdrop: "static",
		keyboard: false,
	});
	$("#exampleModal").modal("show");
}

socket.on("user permission", (username, socketId) => {
	askingPermissionUsers.push({ username, socketId });
	if (askingPermissionUsers.length !== 0)
		setTimeout(() => {
			Utility();
		}, 500);
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

let canSeek = true;
//play event handled
video.on("playing", (event) => {
	console.log("video on playing ", canSeek);

	if (canSeek) {
		socket.emit("play", roomno);
		socket.emit("seeked", video.currentTime, roomno);
	}
});

// pause event handled
video.on("pause", (event) => {
	console.log("video on pause ", canSeek);

	if (canSeek) socket.emit("pause", roomno);
});

// seeking event handled
video.on("seeked", (event) => {
	console.log("video on seeked " + canSeek);
	if (canSeek) {
		console.log("Manually seek happened");
		let was_video_playing = video.playing;
		socket.emit("seeked", video.currentTime, roomno);
		if (was_video_playing) socket.emit("play", roomno);
	}
});

socket.on("play", () => {
	console.log("socket on play ", canSeek);
	canSeek = false;
	setTimeout(() => {
		canSeek = true;
		console.log("socket on play after 500msec canSeek " + canSeek);
	}, 500);
	video.play();
});

socket.on("pause", () => {
	console.log("socket on pause ", canSeek);
	canSeek = false;
	setTimeout(() => {
		canSeek = true;
		console.log("socket on pause after 500msec canSeek " + canSeek);
	}, 500);
	video.pause();
});

socket.on("seeked", (data) => {
	console.log("socket on seeked");
	canSeek = false;
	let was_video_playing = video.playing;
	video.currentTime = data;
	if (was_video_playing) video.play();
	setTimeout(() => {
		canSeek = true;
		console.log("after 500msec canSeek " + canSeek);
	}, 500);
});

const toastContainer = document.getElementById("toast-container");
socket.on("new user", (username) => {
	toastContainer.innerHTML += `<div class="toast" data-autohide="false">
					<div class="toast-header">
						<svg
							class="rounded mr-2"
							width="20"
							height="20"
							xmlns="http://www.w3.org/2000/svg"
							preserveAspectRatio="xMidYMid slice"
							focusable="false"
							role="img"
						>
							<rect fill="#007aff" width="100%" height="100%" />
						</svg>
						<strong class="mr-auto">Notification</strong>
						<button
							type="button"
							class="ml-2 mb-1 close"
							data-dismiss="toast"
							aria-label="Close"
						>
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div class="toast-body">
						${username} has joined the room.
					</div>
				</div>`;
	$(".toast").toast("show");
	setTimeout(() => {
		toastContainer.innerHTML = "";
	}, 5000);
});

socket.on("left room", (username) => {
	toastContainer.innerHTML += `<div class="toast" data-autohide="false">
					<div class="toast-header">
						<svg
							class="rounded mr-2"
							width="20"
							height="20"
							xmlns="http://www.w3.org/2000/svg"
							preserveAspectRatio="xMidYMid slice"
							focusable="false"
							role="img"
						>
							<rect fill="#007aff" width="100%" height="100%" />
						</svg>
						<strong class="mr-auto">Notification</strong>
						<button
							type="button"
							class="ml-2 mb-1 close"
							data-dismiss="toast"
							aria-label="Close"
						>
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div class="toast-body">
						${username} has left the room.
					</div>
				</div>`;
	$(".toast").toast("show");
	setTimeout(() => {
		toastContainer.innerHTML = "";
	}, 3000);
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
