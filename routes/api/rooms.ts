// routes/api/books.js

import express from 'express'
// import RoomType from '../../models/types/RoomType';
import {
    createNewRoom,
    deleteRoom,
    getRoom,
    insertLatestMessage,
    joinRoom,
    leaveRoom,
} from '../../controllers/RoomController'
import createJWT from '../../auth/createJWT'
import ParticipantType from '../../models/types/ParticipantType'
import expressUserAuth from '../../auth/expressUserAuth'
const router = express.Router()

function assignJwtCookie(participant: ParticipantType, res: express.Response) {
    const token = createJWT(participant)

    res.cookie('jwt', token, {
        httpOnly: true,
    })
}

router.get('/test', (req, res) => {
    res.send('room route testing!')
})

router.get('/:id', (req, res) => {
    getRoom(req.params.id).then((room) => res.json(room))
})

router.post('/createroom', (req, res) => {
    createNewRoom(req.body).then((room) => {
        const participant = room.participants[0]
        assignJwtCookie(participant, res)
        res.json({ room, participant })
    })
})

router.post('/joinroom', (req, res) => {
    const { roomId, participant } = req.body

    joinRoom(roomId, participant).then(
        ({ room, participant: finalParticipant }) => {
            assignJwtCookie(finalParticipant, res)
            res.json({ room, participant: finalParticipant })
        }
    )
})

router.post('/leaveroom', (req, res) => {
    leaveRoom(req.body.roomId, req.body.participantId).then((room) =>
        res.json(room)
    )
})

router.post('/deleteroom', (req, res) => {
    deleteRoom(req.body.roomId).then((room) => res.json(room))
})

router.post('/insertmessage', expressUserAuth, (req, res) => {
    const { roomId, participantId, text } = req.body
    insertLatestMessage(roomId, participantId, text).then((room) =>
        res.json(room)
    )
})

export default router
