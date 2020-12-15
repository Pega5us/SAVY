// Client

let initialUrl = "https://sync-player666.herokuapp.com";

let current_roomno = new URLSearchParams(window.location.search).get("roomno");
if (current_roomno) {
	document.getElementById("input").value = current_roomno
}

function create() {
	const username = document.getElementById("username").value;
	if (username !== "") {
		let response = httpGet(`${initialUrl}/getRoomNumber`);
		let url = `${initialUrl}/room/${response}?username=${username}`;
		window.location.href = url;
	} else {
		swal({
			title: "Enter your username first!",
			icon: "warning",
			dangerMode: true,
		});
	}
}

function join() {
	const username = document.getElementById("username").value;
	const roomno = document.getElementById("input").value;
	if (username !== "" && roomno !== "") {
		let url = `${initialUrl}/room/${roomno}?username=${username}`;
		window.location.href = url;
	} else {
		swal({
			title: "Enter full details!",
			icon: "warning",
			dangerMode: true,
		});
	}
}

function httpGet(theUrl) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, false); // false for synchronous request
	xmlHttp.send(null);
	return xmlHttp.responseText;
}
