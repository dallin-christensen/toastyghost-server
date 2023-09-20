// routes/api/books.js

import express from 'express'
// import RoomType from '../../models/types/RoomType';
import { createNewRoom, deleteRoom, joinRoom, leaveRoom } from '../../controllers/RoomController';
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

// // @route GET api/books/:id
// // @description Get single book by id
// // @access Public
// router.get('/:id', (req, res) => {
//   Book.findById(req.params.id)
//     .then((book: BookType) => res.json(book))
//     .catch((err: any) => res.status(404).json({ nobookfound: 'No Book found' }));
// });
// // @route GET api/books
// // @description add/save book
// // @access Public
// router.post('/', (req, res) => {
//   Book.create(req.body)
//     .then((book: BookType) => res.json({ msg: 'Book added successfully' }))
//     .catch((err: any) => res.status(400).json({ error: 'Unable to add this book' }));
// });


export default router