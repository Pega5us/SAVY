// Client

let initialUrl = "https://sync-player666.herokuapp.com";

let current_roomno = new URLSearchParams(window.location.search).get("roomno");
if (current_roomno) {
	document.getElementById("input").value = current_roomno;
}

function create() {
	const username = document.getElementById("username").value;
	if (username !== "") {
		let response = httpGet(`${initialUrl}/getRoomNumber`);
		let url = `${initialUrl}/room/${response}?username=${username}`;
		window.location.href = url;
	} else {
		document.getElementById("username").style.boxShadow =
			"5px 10px 18px darkblue";
		setTimeout(function () {
			document.getElementById("username").style.boxShadow =
				"5px 10px 18px red";
		}, 2000);
	}
}

function join() {
	const username = document.getElementById("username").value;
	const roomno = document.getElementById("input").value;
	if (username !== "" && roomno !== "") {
		let url = `${initialUrl}/room/${roomno}?username=${username}`;
		window.location.href = url;
	} else {
		if (username == "" && roomno == "") {
			document.getElementById("username").style.boxShadow =
				"5px 10px 18px darkblue";
			document.getElementById("input").style.boxShadow =
				"5px 10px 18px darkblue";
			setTimeout(function () {
				document.getElementById("username").style.boxShadow =
					"5px 10px 18px red";
				document.getElementById("input").style.boxShadow =
					"5px 10px 18px red";
			}, 2000);
		} else if (username == "" && roomno !== "") {
			document.getElementById("username").style.boxShadow =
				"5px 10px 18px darkblue";
			setTimeout(function () {
				document.getElementById("username").style.boxShadow =
					"5px 10px 18px red";
			}, 2000);
		} else {
			document.getElementById("input").style.boxShadow =
				"5px 10px 18px darkblue";
			setTimeout(function () {
				document.getElementById("input").style.boxShadow =
					"5px 10px 18px red";
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
