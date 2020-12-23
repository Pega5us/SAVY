const express = require("express");
const socket = require("socket.io");
const join = require("path").join;
const url = require("url");

const app = express();
var PORT = process.env.PORT || 5000;

app.use(express.static("public"));

// Run the server
const server = app.listen(PORT, () => {
	console.log(`Server running at ${PORT}`);
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

	// Checking authentication for roomno
	if (!rooms.hasOwnProperty(roomno)) {
		return res.sendFile(join(__dirname, "public", "roomInvalid.html"));
	}

	// Sending response if the username is not provided
	if (queryObject.username) {
		return next();
	} else {
		// Authentication done redirecting to room
		return res.redirect(
			`https://savy-player.herokuapp.com/?roomno=${roomno}`
		);
	}
};

// Join room route
app.get("/room/:roomno", isAuthenticated, (req, res) => {
	res.sendFile(join(__dirname, "public", "player.html"));
});

// Route for getting available room numbers and initialising the room object
app.get("/getRoomNumber", (req, res) => {
	let roomno;
	do {
		roomno = Math.floor(Math.random() * 10000 + 100000);
	} while (rooms.hasOwnProperty(roomno));

	// Initialising room
	rooms[roomno] = {};
	rooms[roomno].array = [];

	// If no one joins the room kill the room in 10 mins
	setTimeout(
		(roomno) => {
			console.log(`Checking if someone has joined the room ${roomno}`);
			if (rooms[roomno].hasJoined) {
				console.log(`Room ${roomno} killed since no joined the room`);
				delete rooms[roomno];
			}
		},
		600000,
		roomno
	);

	res.send(`${roomno}`);
});

app.get("/getRoomList", (_req, res) => {
	res.send(Object.keys(rooms));
});

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

// Code when socket makes a connection to server
io.on("connection", (socket) => {
	console.log(`Socket ${socket.id} is connected`);

	// Permission to enter the room
	socket.on("ask permission", (roomno, username) => {
		console.log(`Socket ${socket.id} has asked to enter the room`);

		// Checking if the room exist
		if (!rooms.hasOwnProperty(roomno)) socket.emit("room does not exist");
		else {
			// If the socket is first
			if (rooms[roomno].array.length === 0)
				io.to(socket.id).emit("enter room", true);
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
	socket.on("isAllowed", (isAllowed, socketId) => {
		if (isAllowed) io.to(socketId).emit("enter room", true);
		else io.to(socketId).emit("enter room", false);
	});

	// Join room
	socket.on("joinroom", (roomno, username) => {
		console.log(`Socket ${socket.id} has joined the room`);
		socket.join(roomno);
		socket.to(roomno).emit("new user", username);

		// Storing values for username and roomno in socket object
		socket.username = username;
		socket.roomno = roomno;

		// Setting the rooms value
		rooms[roomno].hasJoined = true; // A flag to check if someone has joined the room
		rooms[roomno].array.push({
			username,
			id: socket.id,
		});

		// If the socket is first make it host
		if (rooms[socket.roomno].array.length === 1)
			rooms[socket.roomno].host = socket.id;

		// Sending the updated username array to room
		io.in(socket.roomno).emit(
			"user_array",
			rooms[socket.roomno].array.map((obj) => obj.username)
		);
	});

	//Chat events
	socket.on("New Message", (message, username, roomno) => {
		console.log("server side userID");
		socket.to(roomno).emit("New Message", message, username);
	});

	// Player events
	socket.on("play", (roomno) => {
		console.log("play event occurred");
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

		socket.to(socket.roomno).emit("left room", socket.username);
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
			)
				rooms[socket.roomno].host = rooms[socket.roomno].array[0].id;

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
