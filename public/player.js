window.onbeforeunload = () => {
	return "Are you sure?";
};

// Getting roomno from URL
let temp_arr = window.location.pathname.split("/");
let roomno = temp_arr[temp_arr.length - 1];

// Getting username from URL
let current_username = new URLSearchParams(window.location.search).get(
	"username"
);

// Buildig room URL for copy link button
let room_URL = `https://savy-player.herokuapp.com/room/${roomno}`;

document.getElementById("roomNo").innerText = roomno;
document.getElementById("userDetail").innerText = current_username;

// Initialising socket
const socket = io();

//Asking permission to enter the room
socket.emit("ask permission", roomno, current_username);

// Room does not exist
socket.on("room does not exist", () => {
	window.location.href = "https://savy-player.herokuapp.com";
});

// $(".toast").toast("show");

// Listenting for host reply
socket.on("enter room", (isAllowed) => {
	// allowed to enter the room
	if (isAllowed) {
		socket.emit("joinroom", roomno, current_username);
		document.getElementById("spinner").remove();
		document.getElementById("body-content").removeAttribute("hidden");
	}
	// not allowed to enter the room
	else window.location.href = "https://savy-player.herokuapp.com";
});

// Array to hold the pending permission of user to enter the room
askingPermissionUsers = [];

// Utility function to emit accept/deny permission
// then delete the permission
// and check for new permission
function permissionSpliceAndCheckPermission(isAllowed) {
	socket.emit("isAllowed", isAllowed, askingPermissionUsers[0].socketId);
	askingPermissionUsers.splice(0, 1);
	if (askingPermissionUsers.length !== 0) {
		setTimeout(() => {
			Utility();
		}, 500);
	}
}

// Decline new user from entering the room
document.getElementById("decline-btn").onclick = () => {
	permissionSpliceAndCheckPermission(false);
};

// Accept new user into the room
document.getElementById("accept-btn").onclick = () => {
	permissionSpliceAndCheckPermission(true);
};

// Utility function to show new permission to the host
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

// New user permission
socket.on("user permission", (username, socketId) => {
	askingPermissionUsers.push({ username, socketId });
	setTimeout(() => {
		Utility();
	}, 500);
});

// Sync video
socket.on("get time from host", (socketId) => {
	socket.emit(
		"video current state",
		video.currentTime,
		video.playing,
		socketId
	);
});

function syncVideo() {
	socket.emit("sync video");
}

function makeMeHost() {
	socket.emit("make me host");
}

function copyLink() {
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

const video = new Plyr("#video", {
	settings: ["captions", "quality"],
});
const video_HTML = document.querySelector("video");
const playSelectedFile = function (_event) {
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
const addCaptionFile = function (_event) {
	if (this.files.length == 1) {
		if (this.files[0].type != "video/mp4") alert("File should be a video");
		else {
			video.source = {
				type: "video",
				title: "Example title",
				sources: [
					{
						src: URL.createObjectURL(this.files[0]),
						type: "video/mp4",
						size: 720,
					},
				],
			};
		}
	} else if (this.files.length == 2) {
		let file0 = this.files[0];
		let file1 = this.files[1];
		if (file0.type != "video/mp4" && file1.type != "video/mp4")
			alert("One file should be video");
		if (file0.type == "video/mp4" && file1.type == "video/mp4")
			alert("One file should be caption");
		else {
			let videoURL, captionURL;
			if (file0.type == "video/mp4") {
				videoURL = file0;
				captionURL = file1;
			} else {
				videoURL = file1;
				captionURL = file0;
			}

			video.source = {
				type: "video",
				title: "Example title",
				sources: [
					{
						src: URL.createObjectURL(videoURL),
						type: "video/mp4",
						size: 720,
					},
				],
				tracks: [
					{
						kind: "captions",
						label: "English",
						srclang: "en",
						src: URL.createObjectURL(captionURL),
						default: true,
					},
				],
			};
		}
	} else if (this.files.length > 2) alert("More than two files selected");
	else alert("No file choosen");
};
document
	.getElementById("input")
	.addEventListener("change", playSelectedFile, false);
document
	.getElementById("caption_input")
	.addEventListener("change", addCaptionFile);

//play event
video.on("playing", (event) => {
	socket.emit("play", roomno);
	socket.emit("seeked", video.currentTime, roomno);
});

// pause event
video.on("pause", (event) => {
	socket.emit("pause", roomno);
});

// seeking event
video.on("seeked", (event) => {
	let was_video_playing = video.playing;
	socket.emit("seeked", video.currentTime, roomno);
	if (was_video_playing) socket.emit("play", roomno);
});

const inputField = document.getElementById("inputField");
const sendMessageButton = document.getElementById("sendbutton");

function checkempty() {
	if (inputField.value === "") {
		sendMessageButton.disabled = true;
	} else {
		sendMessageButton.disabled = false;
	}
}

function sendmessage() {
	console.log("Sending Message", inputField.value);

	chatbody.innerHTML += `
	<div class="col-sm-12 my-auto" >
	 	<div class = "float-right p-2 mt-2" style="background-color:#343A40 ;color:white;border-radius: 15px 15px 0px 15px;max-width:200px">
		<div class="float-left"><b>You</b></div></br>
		 <div >${inputField.value}</div>
		<div class="float-right">${new moment().format("h:mm a")}</div></div></div>`;

	socket.emit("New Message", inputField.value, current_username, roomno);
	let objDiv = document.getElementById("chatpanel");
	objDiv.scrollTop = objDiv.scrollHeight;
	inputField.value = "";
	sendMessageButton.disabled = true;
}

const chatbody = document.getElementById("chatbody");

socket.on("New Message", (message, username) => {
	chatbody.innerHTML += `
		<div class="col-sm-12 my-auto">
		 <div class = "float-left p-2 mt-2" style="background-color:#343A40;color:white;border-radius: 15px 15px 15px 0px;max-width:200px">
		<div class="float-left"><b>${username}</b></div></br>
		 <div class="mt-1">${message}</div>
		<div class="float-right">${new moment().format("h:mm a")}</div></div></div>`;

	let objDiv = document.getElementById("chatpanel");
	objDiv.scrollTop = objDiv.scrollHeight;
	let x = document.getElementById("chatRoom");
	if (chatIsHidden == true) {
		let chatButton = document.getElementById("chat_button");
		chatButton.style.backgroundColor = "#181a1b";
		if (!chatButton.innerHTML.endsWith("*")) chatButton.innerHTML += "*";
	}
});

socket.on("play", () => {
	video.play();
});

socket.on("pause", () => {
	video.pause();
});

socket.on("seeked", (data) => {
	let was_video_playing = video.playing;
	video.currentTime = data;
	if (was_video_playing) video.play();
});

let toastContainer = document.getElementById("toast-container");

socket.on("new user", (username) => {
	toastUserAddRemove(username, "joined");
});

socket.on("left room", (username) => {
	toastUserAddRemove(username, "left");
});

socket.on("user_array", (user_array) => {
	// Getting the array of users in room
	console.log(user_array);
	document.getElementById("no_of_members").innerText = user_array.length;
	let sidePanel = document.getElementById("sidePanel");
	sidePanel.innerHTML = "";
	user_array.map((users) => {
		let a_tag = document.createElement("a");
		let node = document.createTextNode(users);
		a_tag.classList.add("dropdown-item");
		a_tag.style.color = "white";
		a_tag.style.backgroundColor = "transparent";
		a_tag.style.opacity = "1";
		a_tag.appendChild(node);
		sidePanel.appendChild(a_tag);
	});
});

socket.on("current host", (username) => {
	document.getElementById("hostDetail").innerText = username;
});

let chatIsHidden = true;

function chatRoom() {
	setTimeout(() => {
		if (chatIsHidden) {
			document.getElementById("chatCol").removeAttribute("hidden");
			chatIsHidden = false;
		} else {
			chatIsHidden = true;
		}
	}, 400);

	if (chatIsHidden) {
		let chatButton = document.getElementById("chat_button");
		chatButton.style.backgroundColor = "transparent";
		chatButton.innerHTML = chatButton.innerHTML.replace("*", "");
		document.getElementById("videoCol").classList.remove("col-md-12");
		document.getElementById("videoCol").classList.add("col-md-8");
	} else {
		document.getElementById("videoCol").classList.remove("col-md-8");
		document.getElementById("videoCol").classList.add("col-md-12");
		document.getElementById("chatCol").setAttribute("hidden", "hidden");
	}
}

function toastUserAddRemove(username, eventHappened) {
	toastContainer.style.padding = "10px";
	toastContainer.style.backgroundColor = "#181a1b";
	toastContainer.style.opacity = "0.8";
	toastContainer.style.borderRadius = "8px";
	toastContainer.innerHTML += `<div class="toast" data-autohide="false">
					<div class="toast-header">
						<svg
							class="rounded mr-2 ml-2"
							width="20"
							height="20"
							xmlns="http://www.w3.org/2000/svg"
							preserveAspectRatio="xMidYMid slice"
							focusable="false"
							role="img"
						>
							<rect fill="#007aff" width="100%" height="100%" />
						</svg>
						<strong class="mr-auto" style="color:white">Notification</strong>
					</div>
					<div class="toast-body ml-2 mb-3" style="color:white">
						${username} has ${eventHappened} the room.
					</div>
				</div>`;
	setTimeout(() => {
		toastContainer.innerHTML = "";
		toastContainer.style.padding = "0px";
	}, 5000);
}

document.onkeypress = function (e) {
	if (e.keyCode == 13 && inputField.value != "") {
		sendMessageButton.onclick();
	}
};
