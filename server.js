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
	console.log("isAuthenticated");
	if (!rooms.hasOwnProperty(roomno)) {
		console.log(1);
		return res.sendFile(join(__dirname, "public", "roomInvalid.html"));
	}

	// Sending response if the username is not provided
	if (queryObject.username) {
		return next();
	} else {
		return res.redirect(`http://localhost:5000/?roomno=${roomno}`);
	}
};

app.get("/room/:roomno", isAuthenticated, (req, res) => {
	res.sendFile(join(__dirname, "public", "player.html"));
});

app.get("/getRoomNumber", (req, res) => {
	let roomno;
	do {
		roomno = Math.floor(Math.random() * 10000 + 100000);
	} while (rooms.hasOwnProperty(roomno));
	rooms[roomno] = {};
	rooms[roomno].array = [];
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
	socket.on("ask permission", (roomno, username) => {
		console.log(socket.id + " has asked to enter the room");
		if (!rooms.hasOwnProperty(roomno)) socket.emit("room does not exist");
		else {
			if (rooms[roomno].array.length === 0)
				io.to(socket.id).emit("enter room", true);
			else {
				io.to(rooms[roomno].host).emit(
					"user permission",
					username,
					socket.id
				);
			}
		}
	});

	socket.on("isAllowed", (isAllowed, socketId) => {
		console.log(socketId + " " + isAllowed);
		if (isAllowed) io.to(socketId).emit("enter room", true);
		else io.to(socketId).emit("enter room", false);
	});

	socket.on("joinroom", (roomno, username) => {
		socket.join(roomno);
		socket.to(roomno).emit("new user", username);
		socket.username = username;
		socket.roomno = roomno;
		rooms[roomno].array.push({
			username,
			id: socket.id,
		});
		if (rooms[socket.roomno].array.length === 1)
			rooms[socket.roomno].host = socket.id;
		io.in(socket.roomno).emit(
			"user_array",
			rooms[socket.roomno].array.map((obj) => obj.username)
		);
	});
	socket.on("update", (data, roomno) => {
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
		if (rooms.hasOwnProperty(socket.roomno) && rooms[socket.roomno].array) {
			rooms[socket.roomno].array.splice(
				rooms[socket.roomno].array.findIndex((x) => x.id === socket.id),
				1
			);
			// Transfer host
			if (
				rooms[socket.roomno].array.length > 0 &&
				rooms[socket.roomno].host === socket.id
			)
				rooms[socket.roomno].host = rooms[socket.roomno].array[0].id;
			socket.to(socket.roomno).emit(
				"user_array",
				rooms[socket.roomno].array.map((obj) => obj.username)
			);
			// If no one is in room
			if (rooms[socket.roomno].array.length === 0) {
				setTimeout(
					(roomno) => {
						if (
							rooms.hasOwnProperty(roomno) &&
							rooms[roomno].array.length === 0
						) {
							delete rooms[roomno];
							console.log("Room deleted " + roomno);
						}
					},
					600000,
					socket.roomno
				);
			}
		}
	});
});
