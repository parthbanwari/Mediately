const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

io.on('connection', socket => {
  console.log('New client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});

app.get('/', (req, res) => res.send('Server is running'));

server.listen(5000, () => console.log('Server running on port 5000'));
