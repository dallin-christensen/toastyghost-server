import express from 'express'
import connectDB from './config/db'
import books from './routes/api/books'
import rooms from './routes/api/rooms'
import bodyParser from 'body-parser'
import cors from 'cors'
import { Server } from 'socket.io'
import {
    deleteRoom,
    getRoom,
    insertLatestMessage,
    leaveRoom,
} from './controllers/RoomController'
import cookieParser from 'cookie-parser'
import verifyParticipant from './auth/verifyParticipant'

connectDB()

const app = express()

app.use(cors({ origin: true, credentials: true }))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(cookieParser())

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
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        allowedHeaders: ['jwt'],
        credentials: true,
    },
    cookie: true,
} as any)

io.on('connection', (socket) => {
    console.log('user connected')

    socket.on('disconnect', async () => {
        const roomId = socket.data.roomId
        const participantId = socket.data.participantId

        const successCb = async () => {
            const updatedRoom = await leaveRoom(roomId, participantId)
            io.to(roomId).emit('leftroom', updatedRoom, participantId)

            if (updatedRoom.host === participantId) {
                await deleteRoom(roomId)
                io.to(roomId).emit('roomdeleted')
            }
        }

        const failCb = () => {
            console.error('failed authorization')
        }

        const cookie = socket.handshake.headers.cookie ?? ''

        verifyParticipant(cookie, participantId, successCb, failCb)
    })

    socket.on('leaveroom', async () => {
        // TODO this is a copy of disconnect, should abstract this logic in the future
        const roomId = socket.data.roomId
        const participantId = socket.data.participantId

        const successCb = async () => {
            const updatedRoom = await leaveRoom(roomId, participantId)
            io.to(roomId).emit('leftroom', updatedRoom, participantId)

            if (updatedRoom.host === participantId) {
                await deleteRoom(roomId)
                io.to(roomId).emit('roomdeleted')
            }
        }

        const failCb = () => {
            console.error('failed authorization')
        }

        const cookie = socket.handshake.headers.cookie ?? ''

        verifyParticipant(cookie, participantId, successCb, failCb)
    })

    socket.on('subscribe', async (roomId, participantId) => {
        socket.data.participantId = participantId
        socket.data.roomId = roomId

        const successCb = async () => {
            socket.join(roomId)
            const latestRoom = await getRoom(roomId)
            io.to(roomId).emit('joinedroom', latestRoom)
        }

        const failCb = () => {
            console.error('failed authorization')
        }

        const cookie = socket.handshake.headers.cookie ?? ''

        verifyParticipant(cookie, participantId, successCb, failCb)
    })

    socket.on('insertmessage', async (payload) => {
        const { roomId, participantId, text } = payload

        const successCb = async () => {
            const updatedRoom = await insertLatestMessage(
                roomId,
                participantId,
                text
            )
            io.to(roomId).emit('messageinserted', updatedRoom)
        }

        const failCb = () => {
            console.error('failed authorization')
        }

        const cookie = socket.handshake.headers.cookie ?? ''

        verifyParticipant(cookie, participantId, successCb, failCb)
    })
})

io.on('connect_error', (err) => {
    console.log(`connect_error due to ${err.message}`)
})
