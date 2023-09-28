import express from 'express'
import connectDB from './config/db'
import books from './routes/api/books'
import rooms from './routes/api/rooms'
import bodyParser from 'body-parser'
import cors from 'cors'
import { Server } from 'socket.io';
import { insertLatestMessage } from './controllers/RoomController'

connectDB()

const app = express()

app.use(cors({ origin: true, credentials: true }))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

const port = process.env.PORT || 8082

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const server = app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.use('/api/books', books)
app.use('/api/rooms', rooms)


const io = new Server(server, {
  cors: "http://localhost:5173"
} as any);

io.on('connection', (socket) => {
  console.log('user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on("subscribe", (topic) => {
    socket.join(topic);
  });

  socket.on('insertmessage', async (payload) => {
    const { roomId, participantId, text } = payload
    const updatedRoom = await insertLatestMessage(roomId, participantId, text)
    io.to(roomId).emit("messageinserted", updatedRoom);
  });
});

io.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});
