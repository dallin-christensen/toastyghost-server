// routes/api/books.js

import express from 'express'
// import RoomType from '../../models/types/RoomType';
import { createNewRoom, deleteRoom, insertLatestMessage, joinRoom, leaveRoom } from '../../controllers/RoomController';
const router = express.Router();

router.get('/test', (req, res) => {
  console.log('poop')
  res.send('room route testing!')
});

router.post('/createroom', (req, res) => {
  createNewRoom(req.body).then(room => res.json(room))
});

router.post('/joinroom', (req, res) => {
  joinRoom(req.body.roomId, req.body.participant).then(room => res.json(room))
})

router.post('/leaveroom', (req, res) => {
  leaveRoom(req.body.roomId, req.body.participantId).then(room => res.json(room))
})

router.post('/deleteroom', (req, res) => {
  deleteRoom(req.body.roomId).then(room => res.json(room))
})

router.post('/insertmessage', (req, res) => {
  const { roomId, participantId, text } = req.body
  insertLatestMessage(roomId, participantId, text).then(room => res.json(room))
})

export default router