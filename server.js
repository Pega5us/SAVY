const express = require("express");
const socket = require("socket.io");
const app = express();
var PORT = process.env.PORT || 5000;
const join = require("path").join;

app.use(express.static("public"));

//Run the server
const server = app.listen(PORT, () => {
  console.log("Server running at " + PORT);
});

// setup sockets
const io = socket(server);

rooms = [];

app.get("/room/:roomno", (req, res) => {
  const roomno = req.params.roomno;
  res.sendFile(join(__dirname, "public", "player.html"));
});

app.get("/getRoomNumber", (req, res) => {
  console.log("Get Room");
  let roomno;
  do {
    roomno = Math.floor(Math.random() * 10000 + 100000);
  } while (rooms.includes(roomno));
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

	socket.on("joinroom", (roomno) => {
		socket.join(roomno)
		rooms.push(roomno);
	})
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
	})
	socket.on("slider", (data, roomno) => {
		socket.to(roomno).emit("slider", data);
	});
});
