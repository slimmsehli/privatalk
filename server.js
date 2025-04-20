const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store participants for each room
const rooms = {};

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
  let roomID;

  socket.on('join', (id) => {
    roomID = id;

    // Add user to the room's participant list
    if (!rooms[roomID]) {
      rooms[roomID] = [];
    }
    rooms[roomID].push(socket.id);

    // Notify other participants in the room that a new user joined
    socket.to(roomID).emit('user-joined', socket.id);

    // Send the current list of participants to the new user
    socket.emit('participant-list', rooms[roomID]);

    // Broadcast updated participant list to everyone
    io.to(roomID).emit('update-participant-list', rooms[roomID]);

    socket.on('signal', (payload) => {
      io.to(payload.to).emit('signal', {
        from: socket.id,
        signal: payload.signal
      });
    });

    // When a user disconnects, remove them from the participant list
    socket.on('disconnect', () => {
      if (rooms[roomID]) {
        rooms[roomID] = rooms[roomID].filter(id => id !== socket.id);
        io.to(roomID).emit('user-left', socket.id);
        io.to(roomID).emit('update-participant-list', rooms[roomID]);
      }
    });
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