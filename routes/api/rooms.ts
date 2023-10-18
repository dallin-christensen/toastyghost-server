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
    lookupParticipantInRoom,
} from '../../controllers/RoomController'
import createJWT from '../../auth/createJWT'
import ParticipantType from '../../models/types/ParticipantType'
import expressUserAuth from '../../auth/expressUserAuth'
import verifyParticipant from '../../auth/verifyParticipant'
const router = express.Router()

function assignJwtCookie(participant: ParticipantType, res: express.Response) {
    const token = createJWT(participant)

    res.cookie('jwt', token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        domain: 'toastyghost.dev',
    })
}

router.get('/test', (req, res) => {
    res.send('room route testing!')
})

router.get('/:id', (req, res, next) => {
    getRoom(req.params.id)
        .then((room) => res.json(room))
        .catch(next)
})

router.post('/createroom', (req, res, next) => {
    createNewRoom(req.body)
        .then((room) => {
            const participant = room.participants[0]
            assignJwtCookie(participant, res)
            res.json({ room, participant })
        })
        .catch(next)
})

router.post('/joinroom', (req, res, next) => {
    const { roomId, participant } = req.body

    joinRoom(roomId, participant)
        .then(({ room, participant: finalParticipant }) => {
            assignJwtCookie(finalParticipant, res)
            res.json({ room, participant: finalParticipant })
        })
        .catch(next)
})

router.post('/leaveroom', (req, res, next) => {
    leaveRoom(req.body.roomId, req.body.participantId)
        .then((room) => res.json(room))
        .catch(next)
})

router.post('/participantroomlookup', (req, res, next) => {
    const { cookies, body } = req
    const { roomId, participantId } = body

    const succesCb = () => {
        lookupParticipantInRoom(roomId, participantId)
            .then((lookup) => {
                res.json(lookup)
            })
            .catch(next)
    }

    verifyParticipant(cookies, participantId, succesCb, (err) => {
        res.status(400).json({ msg: 'failed auth' })
    })
})

router.post('/deleteroom', (req, res, next) => {
    deleteRoom(req.body.roomId)
        .then((room) => res.json(room))
        .catch(next)
})

router.post('/insertmessage', expressUserAuth, (req, res, next) => {
    const { roomId, participantId, text } = req.body
    insertLatestMessage(roomId, participantId, text)
        .then((room) => res.json(room))
        .catch(next)
})

export default router
