// Client

// Input Username
let userId = document.getElementById("username");
// Room No
let roomNo = document.getElementById("inputRoomNo");
// get Room No
let current_roomno = new URLSearchParams(window.location.search).get("roomno");
let grp1 = document.getElementById("inputGroupPrepend3");
let grp2 = document.getElementById("inputGroupPrepend4");

if (current_roomno) {
	let username = localStorage.getItem("username");
	if (username !== null) {
		const redirect_url = `/room/${current_roomno}?username=${username}`;
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
		let response = httpGet(`/getRoomNumber`);
		let url = `/room/${response}?username=${username}`;
		window.location.href = url;
	}
	// Else it will highlight the required field
	else {
		const x = userId.style.boxShadow;
		const y = grp1.style.boxShadow;
		userId.style.boxShadow = "5px 5px 18px #00897b";
		grp1.style.boxShadow = "5px 5px 18px #00897b";
		setTimeout(function () {
			userId.style.boxShadow = x;
			grp1.style.boxShadow = y;
		}, 2000);
	}
}

// Joining an existing Room
function join() {
	const username = userId.value;
	localStorage.setItem("username", username);
	const roomno = roomNo.value;
	const x = grp2.style.boxShadow;
	const y = roomNo.style.boxShadow;
	if (username !== "" && roomno !== "") {
		let checkRoomExist = httpGet(`/check/${roomno}`);
		if (checkRoomExist === "true") {
			console.log("room found");
			let url = `/room/${roomno}?username=${username}`;
			window.location.href = url;
		} else {
			roomNo.classList.add("is-invalid");
			grp2.style.borderColor = "red";
			grp2.style.color = "red";
			roomNo.style.boxShadow = "none";
			grp2.style.boxShadow = "none";
		}
		setTimeout(() => {
			roomNo.classList.remove("is-invalid");
			grp2.style.boxShadow = x;
			roomNo.style.boxShadow = y;
			grp2.style.borderColor = "white";
			grp2.style.color = "#368755";
		}, 1500);
	} else {
		const w = grp2.style.boxShadow;
		const x = userId.style.boxShadow;
		const y = roomNo.style.boxShadow;
		const z = grp1.style.boxShadow;
		if (username == "" && roomno == "") {
			userId.style.boxShadow = "5px 5px 18px #00897b";
			roomNo.style.boxShadow = "5px 5px 18px #00897b";
			grp1.style.boxShadow = "5px 5px 18px #00897b";
			grp2.style.boxShadow = "5px 5px 18px #00897b";
			setTimeout(function () {
				userId.style.boxShadow = x;
				roomNo.style.boxShadow = y;
				grp1.style.boxShadow = z;
				grp2.style.boxShadow = w;
			}, 2000);
		} else if (username == "" && roomno !== "") {
			userId.style.boxShadow = "5px 5px 18px #00897b";
			grp1.style.boxShadow = "5px 5px 18px #00897b";
			setTimeout(function () {
				userId.style.boxShadow = x;
				grp1.style.boxShadow = z;
			}, 2000);
		} else {
			roomNo.style.boxShadow = "5px 5px 18px #00897b";
			grp2.style.boxShadow = "5px 5px 18px #00897b";
			setTimeout(function () {
				roomNo.style.boxShadow = y;
				grp2.style.boxShadow = w;
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
		if (roomNo.value != "") {
			document.getElementById("key").onclick();
		} else {
			document.getElementById("new_room").onclick();
		}
	}
};

//Modifying CSS of span field before input field
function applyShadow1() {
	roomNo.style.boxShadow = "2px 0 0 2px #368755";
	var ele = grp2;
	ele.style.boxShadow = "-2px 0 0 2px #368755";
	ele.style.backgroundColor = "#181a1b";
}
function removeShadow1() {
	roomNo.style.boxShadow = "none";
	var ele = grp2;
	ele.style.boxShadow = "none";
	ele.style.backgroundColor = "none";
}
function removeShadow() {
	userId.style.boxShadow = "none";
	var ele = grp1;
	ele.style.boxShadow = "none";
	ele.style.backgroundColor = "none";
}
function applyShadow() {
	userId.style.boxShadow = "2px 0 0 2px #368755";
	var ele = grp1;
	ele.style.boxShadow = "-2px 0 0 2px #368755";
	ele.style.backgroundColor = "#181a1b";
}

function buttonFunc() {
	document.getElementById("btn").style.border = "none";
	document.getElementById("btn").style.boxShadow = "none";
}
