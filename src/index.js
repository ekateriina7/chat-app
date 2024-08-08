import express from 'express';
import cors from 'cors';
import { EventEmitter } from 'events';

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

app.options('*', cors(corsOptions));

const emitter = new EventEmitter();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

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
  }

  emitter.on('message', cb);

  res.on('close', () => {
    emitter.off('message', cb)
  })
  console.log(emitter.listenerCount('message'))
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
