import express from 'express';
import cors from 'cors';
import { EventEmitter } from 'events';

const PORT = process.env.PORT || 3005;
const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

app.options('*', cors(corsOptions));

const emmiter = new EventEmitter()

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const messages = [];

app.post('/messages', (req, res) => {
  const { text } = req.body;
  const message = {
    text,
    time: new Date()
  };

  messages.push(message);
  emmiter.emit('message', message)
  res.status(201).send(messages);
});

app.get('/messages', (req, res) => {
  emmiter.once('message', (message) => {
    res.status(200).send(messages);
  })
 
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});