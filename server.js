// === Folder Structure ===
// root/
// ├── public/
// │   └── index.html
// ├── server.js
// └── package.json

// --- server.js ---
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
  socket.on('join', roomID => {
    socket.join(roomID);
    socket.to(roomID).emit('user-joined', socket.id);

    socket.on('signal', payload => {
      io.to(payload.to).emit('signal', {
        from: socket.id,
        signal: payload.signal
      });
    });

    socket.on('disconnect', () => {
      socket.to(roomID).emit('user-left', socket.id);
    });
  });
});

//app.get('/room/:id', (req, res) => {
app.get('/', (req, res) => {
    //res.sendFile(path.join(__dirname, 'public/index.html'));
    res.sendFile(path.join('public/index.html'));
  });

const PORT = process.env.PORT || 8080;
//server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
//server.listen(PORT, '192.168.137.1' , () => console.log(`Server running on http://0.0.0.0:${PORT}`));
server.listen(PORT, () => console.log(`Server running on http://0.0.0.0:${PORT}`));