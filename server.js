const express = require("express");
const socket = require("socket.io");
const join = require("path").join;
const url = require("url");
const ms = require("mediaserver");
const cors = require("cors");
const { nanoid } = require("nanoid");

require("dotenv").config();

const app = express();
app.use(cors());

var PORT = process.env.PORT || 5000;

// For the homepage /
app.use(express.static("public"));

// Run the server
const server = app.listen(PORT, () => {
	console.log(`Server running at ${PORT}`);
});

// Exception handled
process.on("uncaughtException", (exception) => {
	console.log(exception);
});

// Setup sockets
const io = socket(server);

rooms = {};

// Function checks if the room number is valid and username is provided
const isAuthenticated = (req, res, next) => {
	const queryObject = url.parse(req.url, true).query;
	const curr_url = req.url.split("/");
	let roomno = curr_url[curr_url.length - 1];
	if (roomno.includes("?")) roomno = roomno.split("?")[0];

	// Sending response if the room number is invalid
	if (roomno == undefined)
		return res.sendFile(join(__dirname, "public", "roomInvalid.html"));

	// Checking authentication for roomno
	if (!rooms.hasOwnProperty(roomno)) {
		return res.sendFile(join(__dirname, "public", "roomInvalid.html"));
	}

	if (queryObject.username) {
		// Authentication done redirecting to room
		return next();
	} else {
		// Sending response if the username is not provided
		return res.redirect(`/?roomno=${roomno}`);
	}
};

// Join room route
app.get("/room/:roomno", isAuthenticated, (req, res) => {
	res.sendFile(join(__dirname, "public", "player.html"));
});

// Route for getting available room numbers and initialising the room object
app.get("/getRoomNumber", (req, res) => {
	let roomno = nanoid(10);
	console.log("Creating room RoomNumber:", roomno);

	// Initialising room
	rooms[roomno] = {};
	rooms[roomno].array = [];

	// Stores which sockets are allowed to enter the room
	rooms[roomno].isAllowed = {};

	// If no one joins the room kill the room in 10 mins
	setTimeout(
		(roomno) => {
			console.log(`Checking if someone has joined the room ${roomno}`);
			if (!rooms[roomno].hasJoined) {
				console.log(`Room ${roomno} killed since no joined the room`);
				delete rooms[roomno];
			}
		},
		600000,
		roomno
	);

	res.send(roomno);
});

//Check whether room exists or not
app.get("/check/:roomno", (req, res) => {
	if (rooms.hasOwnProperty(req.params.roomno)) res.send(true);
	else res.send(false);
});

app.get("/getPlayerCSS", (_req, res) => {
	res.sendFile(join(__dirname, "public", "player.css"));
});

app.get("/getPlayerJS", (_req, res) => {
	res.sendFile(join(__dirname, "public", "player.js"));
});

app.get("/notifJoin.mp3", (req, res) => {
	ms.pipe(
		req,
		res,
		join(__dirname, "public", "notif_sounds", "notif_join.mp3")
	);
});
app.get("/notifChat.mp3", (req, res) => {
	ms.pipe(
		req,
		res,
		join(__dirname, "public", "notif_sounds", "notif_chat.mp3")
	);
});
app.get("/notifPermission.mp3", (req, res) => {
	ms.pipe(
		req,
		res,
		join(__dirname, "public", "notif_sounds", "notif_permission.mp3")
	);
});

app.get("/checkRoomStatus", (req, res) => {
	if (process.env.SAVY_API_KEY == req.headers.authorization) res.send(rooms);
	else res.sendStatus(401);
});

// Code when socket makes a connection to server
io.on("connection", (socket) => {
	console.log(`Socket ${socket.id} is connected`);

	// Permission to enter the room
	socket.on("ask permission", (roomno, username) => {
		console.log(`Socket ${socket.id} has asked to enter the room`);

		// Checking if the room exist
		if (!rooms.hasOwnProperty(roomno)) socket.emit("room does not exist");
		else {
			// If current person is the first person to enter the room,no permission required
			if (rooms[roomno].array.length === 0) {
				rooms[roomno].isAllowed[socket.id] = true;
				io.to(socket.id).emit("enter room", true);
			}
			// Else ask permission from host
			else {
				io.to(rooms[roomno].host).emit(
					"user permission",
					username,
					socket.id
				);
			}
		}
	});

	// Permission response from host
	socket.on("isAllowed", (roomno, isAllowed, socketId) => {
		if (isAllowed) {
			io.to(socketId).emit("enter room", true);
			// Add the socketId to allow list
			if (rooms.hasOwnProperty(roomno)) {
				rooms[roomno].isAllowed[socketId] = true;
			}
		} else io.to(socketId).emit("enter room", false);
	});

	// Join room
	socket.on("joinroom", (roomno, username, peerId) => {
		// Check if the current socket is allowed in the room
		console.log(
			`Socket ${socket.id} is trying to join room ${roomno}`,
			rooms[roomno].isAllowed[socket.id]
		);
		if (!rooms[roomno].isAllowed[socket.id]) return;

		console.log(`Socket ${socket.id} has joined the room`);
		socket.join(roomno);
		socket.to(roomno).emit("new user", username, peerId);

		// Storing values for username and roomno in socket object
		socket.username = username;
		socket.roomno = roomno;
		socket.peerId = peerId;

		// Setting the rooms value
		rooms[roomno].hasJoined = true; // A flag to check if someone has joined the room
		rooms[roomno].array.push({
			username,
			id: socket.id,
		});

		// If the socket is first make it host
		if (rooms[socket.roomno].array.length === 1) {
			rooms[socket.roomno].host = socket.id;
			rooms[socket.roomno].hostUsername = socket.username;
		}

		// Sending the updated username array to room
		io.in(socket.roomno).emit(
			"user_array",
			rooms[socket.roomno].array.map((obj) => obj.username)
		);

		//Sending update on room host
		io.in(socket.roomno).emit(
			"current host",
			rooms[socket.roomno].hostUsername,
			rooms[socket.roomno].host
		);
	});

	// Sync video from host
	socket.on("sync video", () => {
		io.to(rooms[socket.roomno].host).emit("get time from host", socket.id);
	});

	//get current video state
	socket.on("video current state", (curr_time, isPlaying, socketId) => {
		io.to(socketId).emit("seeked", curr_time);
		if (isPlaying) io.to(socketId).emit("play");
		else io.to(socketId).emit("pause");
	});

	// Host change event
	socket.on("make me host", () => {
		rooms[socket.roomno].host = socket.id;
		rooms[socket.roomno].hostUsername = socket.username;
		io.in(socket.roomno).emit(
			"current host",
			rooms[socket.roomno].hostUsername,
			rooms[socket.roomno].host
		);
	});

	//Chat events
	socket.on("New Message", (message, username, roomno) => {
		socket.to(roomno).emit("New Message", message, username);
	});

	// Player events
	socket.on("play", (roomno) => {
		socket.to(roomno).emit("play");
	});
	socket.on("pause", (roomno) => {
		socket.to(roomno).emit("pause");
	});
	socket.on("seeked", (data, roomno) => {
		socket.to(roomno).emit("seeked", data);
	});

	// Code to run if the socket gets disconnected
	socket.on("disconnect", () => {
		console.log(`Socket ${socket.id} has left the room`);

		socket
			.to(socket.roomno)
			.emit("left room", socket.username, socket.peerId);

		if (rooms.hasOwnProperty(socket.roomno) && rooms[socket.roomno].array) {
			// Deleting the socket
			rooms[socket.roomno].array.splice(
				rooms[socket.roomno].array.findIndex((x) => x.id === socket.id),
				1
			);

			// Transfer host if the socket left was the host
			if (
				rooms[socket.roomno].array.length > 0 &&
				rooms[socket.roomno].host === socket.id
			) {
				rooms[socket.roomno].host = rooms[socket.roomno].array[0].id;
				rooms[socket.roomno].hostUsername =
					rooms[socket.roomno].array[0].username;
				io.in(socket.roomno).emit(
					"current host",
					rooms[socket.roomno].hostUsername,
					rooms[socket.roomno].host
				);
			}

			// Sending the updated username array
			socket.to(socket.roomno).emit(
				"user_array",
				rooms[socket.roomno].array.map((obj) => obj.username)
			);

			// If no one is in room delete the room after 10mins
			if (rooms[socket.roomno].array.length === 0) {
				setTimeout(
					(roomno) => {
						if (
							rooms.hasOwnProperty(roomno) &&
							rooms[roomno].array.length === 0
						) {
							delete rooms[roomno];
							console.log(`Room deleted ${roomno}`);
						}
					},
					600000,
					socket.roomno
				);
			}
		}
	});
});
