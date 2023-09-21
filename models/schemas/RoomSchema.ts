// models/Room.js
const mongoose = require('mongoose');
const RoomSchema = new mongoose.Schema({
  latestMessage: {
    _id: mongoose.Schema.ObjectId,
    text: {
      type: String,
      trim: true,
    },
    participantId: {
      type: String,
    },
    insertedAt: {
      type: Date
    }
  },
  participants: [{
    handle: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    latestMessage: {
      _id: mongoose.Schema.ObjectId,
      text: {
        type: String,
        trim: true,
      },
      participantId: {
        type: String,
      },
      insertedAt: {
        type: Date
      }
    },
  }],
  name: {
    type: String,
    required: true
  },
  host: {
    type: String
  },
  startedAt: {
    type: Date
  },
});

module.exports = RoomSchema