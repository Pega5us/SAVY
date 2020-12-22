// Getting roomno from URL
let temp_arr = window.location.pathname.split("/");
let roomno = temp_arr[temp_arr.length - 1];

// Getting username from URL
let current_username = new URLSearchParams(window.location.search).get(
	"username"
);

// Buildig room URL for copy link button
let room_URL = `http://localhost:5000/room/${roomno}`;

document.getElementById("roomNo").innerText = roomno;
document.getElementById("userDetail").innerText = current_username;

// Initialising socket
const socket = io();

//Asking permission to enter the room
socket.emit("ask permission", roomno, current_username);

// Room does not exist
socket.on("room does not exist", () => {
	window.location.href = "http://localhost:5000";
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
	else window.location.href = "http://localhost:5000";
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

const video = new Plyr("#video");
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

document
	.getElementById("input")
	.addEventListener("change", playSelectedFile, false);

let canSeek = true;

//play event
video.on("playing", (event) => {
	console.log("video on playing ", canSeek);

	if (canSeek) {
		socket.emit("play", roomno);
		socket.emit("seeked", video.currentTime, roomno);
	}
});

// pause event
video.on("pause", (event) => {
	console.log("video on pause ", canSeek);

	if (canSeek) socket.emit("pause", roomno);
});

// seeking event
video.on("seeked", (event) => {
	console.log("video on seeked " + canSeek);
	if (canSeek) {
		console.log("Manually seek happened");
		let was_video_playing = video.playing;
		socket.emit("seeked", video.currentTime, roomno);
		if (was_video_playing) socket.emit("play", roomno);
	}
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
	chatbody.innerHTML += `								<li class="out">
	<div class="chat-img">
		<img
			alt="Avtar"
			src="https://bootdey.com/img/Content/avatar/avatar6.png"
		/>
	</div>
	<div class="chat-body">
		<div class="chat-message">
			<h5> <b>You</b> &nbsp&nbsp ${new moment().format("h:mm a")}</h5>
			<p>${inputField.value} </p>
		</div> 
	</div>
</li>`;
	socket.emit("New Message", inputField.value, current_username, roomno);
	let objDiv = document.getElementById("chatpanel");
	objDiv.scrollTop = objDiv.scrollHeight;
	inputField.value = "";
	sendMessageButton.disabled = true;
}

const chatbody = document.getElementById("chatbody");

socket.on("New Message", (message, username) => {
	chatbody.innerHTML += `<li class="in">
	<div class="chat-img" >
		<img
			alt="Avtar"
			src="https://bootdey.com/img/Content/avatar/avatar1.png"
		/>
	</div>
	<div class="chat-body" >
		<div class="chat-message">
			<h5> <b>${username}</b> &nbsp&nbsp ${new moment().format("h:mm a")} </h5>
			<p>
				${message}
			</p>
		</div>
	</div>
</li>`;

	let objDiv = document.getElementById("chatpanel");
	objDiv.scrollTop = objDiv.scrollHeight;
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
	document.getElementById("hostDetail").innerText = user_array[0];
	user_array.map((users) => {
		let a_tag = document.createElement("a");
		let node = document.createTextNode(users);
		a_tag.classList.add("dropdown-item");
		a_tag.appendChild(node);
		sidePanel.appendChild(a_tag);
	});
});

function chatRoom() {
	const chatRoom = document.getElementById("chatRoom");
	if(chatRoom.style.display=="block"){
		chatRoom.style.display = "none";
	}
	else{
		chatRoom.style.display="block";
	}
}

function toastUserAddRemove(username, eventHappened) {
	toastContainer.style.padding = "10px";
	toastContainer.style.backgroundColor = "#ffffff";
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
						<strong class="mr-auto">Notification</strong>
					</div>
					<div class="toast-body ml-2 mb-3">
						${username} has ${eventHappened} the room.
					</div>
				</div>`;
	setTimeout(() => {
		toastContainer.innerHTML = "";
		toastContainer.style.padding = "0px";
	}, 5000);
}
