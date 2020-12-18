// Client

let initialUrl = "http://localhost:5000";

let errorMessageDiv = document.getElementById("roomNotFoundErrorMessage");
errorMessageDiv.style.display = "none";

let current_roomno = new URLSearchParams(window.location.search).get("roomno");
if (current_roomno) {
	let username = localStorage.getItem("username");
	if (username !== null) {
		const redirect_url = `${initialUrl}/room/${current_roomno}?username=${username}`;
		window.location.href = redirect_url;
	}
	document.getElementById("input").value = current_roomno;
}

let username_local = localStorage.getItem("username");
if (username_local !== "") {
	document.getElementById("username").value = username_local;
}

function create() {
	const username = document.getElementById("username").value;
	localStorage.setItem("username", username);
	if (username !== "") {
		let response = httpGet(`${initialUrl}/getRoomNumber`);
		let url = `${initialUrl}/room/${response}?username=${username}`;
		window.location.href = url;
	} else {
		document.getElementById("username").style.boxShadow =
			"5px 10px 18px #00897b";
		setTimeout(function () {
			document.getElementById("username").style.boxShadow = "none";
		}, 2000);
	}
}

function join() {
	const username = document.getElementById("username").value;
	localStorage.setItem("username", username);
	const roomno = document.getElementById("input").value;
	if (username !== "" && roomno !== "") {
		let roomList = httpGet(`${initialUrl}/getRoomList`);
		if (roomList.includes(roomno)) {
			console.log("room found");
			let url = `${initialUrl}/room/${roomno}?username=${username}`;
			window.location.href = url;
		} else
			errorMessageDiv.style.display =
				"block";
			setTimeout(() => {
				errorMessageDiv.style.display = "none";
			}, 2500);
	} else {
		if (username == "" && roomno == "") {
			document.getElementById("username").style.boxShadow =
				"5px 10px 18px #00897b";
			document.getElementById("input").style.boxShadow =
				"5px 10px 18px #00897b";
			setTimeout(function () {
				document.getElementById("username").style.boxShadow = "none";
				document.getElementById("input").style.boxShadow = "none";
			}, 2000);
		} else if (username == "" && roomno !== "") {
			document.getElementById("username").style.boxShadow =
				"5px 10px 18px #00897b";
			setTimeout(function () {
				document.getElementById("username").style.boxShadow = "none";
			}, 2000);
		} else {
			document.getElementById("input").style.boxShadow =
				"5px 10px 18px #00897b";
			setTimeout(function () {
				document.getElementById("input").style.boxShadow = "none";
			}, 2000);
		}
	}
}

function httpGet(theUrl) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, false); // false for synchronous request
	xmlHttp.send(null);
	return xmlHttp.responseText;
}
