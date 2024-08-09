import express from 'express';
import cors from 'cors';
import { EventEmitter } from 'events';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3005;
const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

const emitter = new EventEmitter();
const messages = [];

app.post('/messages', (req, res) => {
  const { text } = req.body;
  const message = {
    text,
    time: new Date(),
  };

  messages.push(message);
  emitter.emit('message', message);
  res.status(201).send(messages);
});

app.get('/messages', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Cache-Control', 'no-store');

  const cb = (message) => {
    res.write(`data: ${JSON.stringify(message)}\n\n`);
  };

  emitter.on('message', cb);

  res.on('close', () => {
    emitter.off('message', cb);
    res.end();
    console.log('Client disconnected from SSE');
  });

  console.log(emitter.listenerCount('message'));
});

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');

  ws.send(JSON.stringify(messages));

  const sendMessage = (message) => {
    ws.send(JSON.stringify(message));
  };

  emitter.on('message', sendMessage);

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
    emitter.off('message', sendMessage);
  });
});
