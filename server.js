import { createServer } from 'http';
import { URL } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import dbConnect from './utils/db.js';
import Message from './utils/message.model.js';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    handle(req, res, {
      pathname: parsedUrl.pathname,
      query: Object.fromEntries(parsedUrl.searchParams.entries()),
    });
  });

  const io = new Server(server, {
    cors: {
      origin: "*", // adjust as needed for security
    }
  });

  io.on('connection', (socket) => {
    console.log('A client connected', socket.id);

    // Listen for chat messages
    socket.on('chat message', async (msg) => {
      // msg should be: { sender, receiver, content }
      await dbConnect();
      const savedMsg = await Message.create({
        sender: msg.sender,
        receiver: msg.receiver,
        content: msg.content
      });

      // Emit to the receiver (and optionally to the sender)
      socket.broadcast.emit('chat message', savedMsg); // or use socket.broadcast.emit for all except sender
    });

    socket.on('typing', (data) => {
socket.broadcast.emit('typing', data);
    });

    socket.on('disconnect', () => {
      console.log('A client disconnected');
    });
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});