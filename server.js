const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
//const io = new Server(server);

// Store participants for each room
const rooms = {};

app.use(express.static(path.join(__dirname, 'public')));

const io = require('socket.io')(server);

let participants = {};

io.on('connection', socket => {
  console.log('a user connected', socket.id);
  
  // Add user to the room
  socket.on('join', (roomID) => {
    socket.join(roomID);
    participants[socket.id] = roomID;
    io.to(roomID).emit('user-joined', socket.id);
    io.to(roomID).emit('update-participant-list', Object.keys(participants));
  });

  // Handle remote stream broadcast
  socket.on('stream', (data) => {
    io.to(data.roomID).emit('remote-stream', socket.id, data.stream);
  });

  // Handle signaling data (offer/answer)
  socket.on('signal', (data) => {
    socket.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    const roomID = participants[socket.id];
    delete participants[socket.id];
    io.to(roomID).emit('user-left', socket.id);
    io.to(roomID).emit('update-participant-list', Object.keys(participants));
  });
});


//app.get('/room/:id', (req, res) => {
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public/index.html'));
    //res.sendFile(path.join('./public/index.html'));
    //res.sendFile("Public/index.html"); //path.join('/Public/index.html'));
  });

const PORT = process.env.PORT || 3000;
//server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
//server.listen(PORT, '192.168.137.1' , () => console.log(`Server running on http://0.0.0.0:${PORT}`));
server.listen(PORT, () => console.log(`Server running on http://0.0.0.0:${PORT}`));