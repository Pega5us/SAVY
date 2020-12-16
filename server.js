const express = require("express");
const socket = require("socket.io");
const join = require("path").join;
const url = require("url");

const app = express();
var PORT = process.env.PORT || 5000;

app.use(express.static("public"));

//Run the server
const server = app.listen(PORT, () => {
	console.log("Server running at " + PORT);
});

// setup sockets
const io = socket(server);

rooms = {};

const isAuthenticated = (req, res, next) => {
	const queryObject = url.parse(req.url, true).query;
	const curr_url = req.url.split("/");
	let roomno = curr_url[curr_url.length - 1];
	if (roomno.includes("?")) roomno = roomno.split("?")[0];

	// Sending response if the room number is invalid
	if (!rooms.hasOwnProperty(roomno))
		return res.sendFile(join(__dirname, "public", "roomInvalid.html"));

	// Sending response if the username is not provided
	if (queryObject.username) {
		return next();
	} else {
		return res.redirect(`https://sync-player666.herokuapp.com/?roomno=${roomno}`);
	}
};

app.get("/room/:roomno", isAuthenticated, (req, res) => {
	const roomno = req.params.roomno;
	res.sendFile(join(__dirname, "public", "player.html"));
});

app.get("/getRoomNumber", (req, res) => {
	console.log("Get Room");
	let roomno;
	do {
		roomno = Math.floor(Math.random() * 10000 + 100000);
	} while (rooms.hasOwnProperty(roomno));
	rooms[roomno] = [];
	res.send(`${roomno}`);
});

app.get("/getPlayerCSS", (req, res) => {
	res.sendFile(join(__dirname, "public", "player.css"));
});

app.get("/getPlayerDarkCSS", (req, res) => {
	res.sendFile(join(__dirname, "public", "player1.css"));
});

app.get("/getPlayerJS", (req, res) => {
	res.sendFile(join(__dirname, "public", "player.js"));
});

io.on("connection", (socket) => {
	console.log("Connected");

	socket.on("joinroom", (roomno, username) => {
		socket.join(roomno);
		socket.to(roomno).emit("new user", username);
		socket.username = username;
		socket.roomno = roomno;
		rooms[roomno].push(username);
		io.in(socket.roomno).emit("user_array", rooms[socket.roomno]);
	});
	socket.on("update", (data, roomno) => {
		console.log(data);
		socket.to(roomno).emit("update", data);
	});
	socket.on("play", (roomno) => {
		socket.to(roomno).emit("play");
	});
	socket.on("pause", (roomno) => {
		socket.to(roomno).emit("pause");
	});
	socket.on("seeked", (data, roomno) => {
		socket.to(roomno).emit("seeked", data);
	});
	socket.on("slider", (data, roomno) => {
		socket.to(roomno).emit("slider", data);
	});
	socket.on("disconnect", () => {
		socket.to(socket.roomno).emit("left room", socket.username);
		rooms[socket.roomno].splice(
			rooms[socket.roomno].indexOf(socket.username),
			1
		);
		socket.to(socket.roomno).emit("user_array", rooms[socket.roomno]);
		setTimeout(() => {
			if (rooms[socket.roomno].length === 0) delete rooms[socket.roomno];
		}, 30000);
	});
});
