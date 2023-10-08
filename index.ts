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
    updateCoordinates,
} from './controllers/RoomController'
import cookieParser from 'cookie-parser'
import verifyParticipant from './auth/verifyParticipant'
import errorHandler from './middleware/errorHander'
import path from 'path'

console.log('CONSOLE LOG TEST')

connectDB()

const app = express()

app.use(cors({ origin: true, credentials: true }))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(cookieParser())

const port = process.env.PORT || 8082

const server = app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.use('/api/books', books)
app.use('/api/rooms', rooms)

// serving the SPA
app.use(express.static(__dirname + '/client'))
app.get('*', function (request, response) {
    response.sendFile(path.resolve(__dirname, 'client', 'index.html'))
})

app.use(errorHandler)

let roomDeletionQueue: string[] = []

type participantQueue = {
    [key: string]: { participantId: string; roomId: string }
}
let participantDeletionQueue: participantQueue = {}

const deleteRoomIdFromQueue = (roomId: string) => {
    const deleteIndex = roomDeletionQueue.indexOf(roomId)
    roomDeletionQueue.splice(deleteIndex, 1)
}

const deleteParticipantIdFromQueue = (participantId: string) => {
    if (participantDeletionQueue[participantId]) {
        delete participantDeletionQueue[participantId]
    }
}

const io = new Server(server, {
    cors: {
        origin:
            process.env.NODE_ENV !== 'production'
                ? 'http://localhost:5173'
                : undefined,
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
            const room = await getRoom(roomId)

            // if the room host disconnects, we will need to remove the room after one minute.
            // if re-connection happens within that time, room deletion will get cancelled.
            if (room && room.host === participantId) {
                roomDeletionQueue.push(roomId)
                setTimeout(async () => {
                    if (roomDeletionQueue.includes(roomId)) {
                        // if host doesn't reconnect in one minute, delete room
                        await deleteRoom(roomId)
                        socket.to(roomId).emit('roomdeleted')
                        deleteRoomIdFromQueue(roomId)
                    }
                }, 60000)
            }

            // if a participant disconnects, assume they've left the room after one minute
            if (room) {
                participantDeletionQueue[participantId] = {
                    participantId,
                    roomId,
                }
                setTimeout(async () => {
                    if (
                        participantDeletionQueue.hasOwnProperty(participantId)
                    ) {
                        // if host doesn't reconnect in one minute, delete participant
                        const updatedRoom = await leaveRoom(
                            roomId,
                            participantId
                        )
                        socket
                            .to(roomId)
                            .emit('leftroom', updatedRoom, participantId)
                        deleteParticipantIdFromQueue(participantId)
                    }
                }, 60000)
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
            socket.to(roomId).emit('leftroom', updatedRoom, participantId)

            if (updatedRoom.host === participantId) {
                await deleteRoom(roomId)
                socket.to(roomId).emit('roomdeleted')
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
            socket.to(roomId).emit('joinedroom', latestRoom, participantId)

            // checking to see if they're currently a host of a room and reconnecting, if yes, take the room out of the deletion queue
            if (
                latestRoom &&
                latestRoom.host === participantId &&
                roomDeletionQueue.includes(roomId)
            ) {
                deleteRoomIdFromQueue(roomId)
            }

            // checking to see if they're in the participant deletion queue, if yes, take out of the queue.
            if (
                latestRoom &&
                latestRoom.participants.length &&
                participantDeletionQueue[participantId]
            ) {
                deleteParticipantIdFromQueue(participantId)
            }
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

    socket.on('updatecoordinates', async (payload) => {
        const { roomId, participantId, x, y } = payload

        const successCb = async () => {
            const updatedRoom = await updateCoordinates(
                roomId,
                participantId,
                x,
                y
            )
            io.to(roomId).emit('coordinatesupdated', updatedRoom)
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
