// Client

let initialUrl = "https://savy-player.herokuapp.com";
// Input Username
let userId = document.getElementById("username");
// Room No
let roomNo = document.getElementById("inputRoomNo");
// get Room No
let current_roomno = new URLSearchParams(window.location.search).get("roomno");

if (current_roomno) {
	let username = localStorage.getItem("username");
	if (username !== null) {
		const redirect_url = `${initialUrl}/room/${current_roomno}?username=${username}`;
		window.location.href = redirect_url;
	}
	roomNo.value = current_roomno;
}

let username_local = localStorage.getItem("username");
if (username_local !== null) {
	userId.value = username_local;
}

// Create New Room
function create() {
	const username = userId.value;
	localStorage.setItem("username", username);
	// If Username field is not empty new room will be created
	if (username !== "") {
		let response = httpGet(`${initialUrl}/getRoomNumber`);
		let url = `${initialUrl}/room/${response}?username=${username}`;
		window.location.href = url;
	}
	// Else it will highlight the required field
	else {
		userId.style.boxShadow = "5px 5px 18px #00897b";
		setTimeout(function () {
			userId.style.boxShadow = "none";
		}, 2000);
	}
}

// Joining an existing Room
function join() {
	const username = userId.value;
	localStorage.setItem("username", username);
	const roomno = roomNo.value;
	if (username !== "" && roomno !== "") {
		let checkRoomExist = httpGet(`${initialUrl}/check/${roomno}`);
		if (checkRoomExist === "true") {
			console.log("room found");
			let url = `${initialUrl}/room/${roomno}?username=${username}`;
			window.location.href = url;
		} else {
			roomNo.classList.add("is-invalid");
		}
		setTimeout(() => {
			roomNo.classList.remove("is-invalid");
		}, 1500);
	} else {
		if (username == "" && roomno == "") {
			userId.style.boxShadow = "5px 5px 18px #00897b";
			roomNo.style.boxShadow = "5px 5px 18px #00897b";
			setTimeout(function () {
				userId.style.boxShadow = "none";
				roomNo.style.boxShadow = "none";
			}, 2000);
		} else if (username == "" && roomno !== "") {
			userId.style.boxShadow = "5px 5px 18px #00897b";
			setTimeout(function () {
				userId.style.boxShadow = "none";
			}, 2000);
		} else {
			roomNo.style.boxShadow = "5px 5px 18px #00897b";
			setTimeout(function () {
				roomNo.style.boxShadow = "none";
			}, 2000);
		}
	}
}

// Utility function for sending request to server
function httpGet(theUrl) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, false); // false for synchronous request
	xmlHttp.send(null);
	return xmlHttp.responseText;
}

// Joining Room on Enter Key Press
roomNo.onkeypress = function (e) {
	if (e.keyCode == 13) {
		document.getElementById("key").onclick();
	}
};

// Creating Room on Enter Key Press
userId.onkeypress = function (e) {
	if (e.keyCode == 13) {
		document.getElementById("new_room").onclick();
	}
};
