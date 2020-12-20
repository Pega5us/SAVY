// Client

let initialUrl = "https://savy-player.herokuapp.com";

let errorMessageToast = document.getElementById("roomNotFoundErrorMessage");

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
if (username_local !== null) {
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
			"5px 5px 18px #00897b";
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
		let checkRoomExist = httpGet(`${initialUrl}/check/:roomno`);
		if (!checkRoomExist) {
			console.log("room found");
			let url = `${initialUrl}/room/${roomno}?username=${username}`;
			window.location.href = url;
		} else {
			document.getElementById("input").classList.add("is-invalid");
		}
		setTimeout(() => {
			document.getElementById("input").classList.remove("is-invalid");
		}, 1500);
	} else {
		if (username == "" && roomno == "") {
			document.getElementById("username").style.boxShadow =
				"5px 5px 18px #00897b";
			document.getElementById("input").style.boxShadow =
				"5px 5px 18px #00897b";
			setTimeout(function () {
				document.getElementById("username").style.boxShadow = "none";
				document.getElementById("input").style.boxShadow = "none";
			}, 2000);
		} else if (username == "" && roomno !== "") {
			document.getElementById("username").style.boxShadow =
				"5px 5px 18px #00897b";
			setTimeout(function () {
				document.getElementById("username").style.boxShadow = "none";
			}, 2000);
		} else {
			document.getElementById("input").style.boxShadow =
				"5px 5px 18px #00897b";
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

document.getElementById("input").onkeypress = function (e) {
	if (e.keyCode == 13) {
		document.getElementById("key").onclick();
	}
};
document.getElementById("username").onkeypress = function (e) {
	if (e.keyCode == 13) {
		document.getElementById("new_room").onclick();
	}
};
