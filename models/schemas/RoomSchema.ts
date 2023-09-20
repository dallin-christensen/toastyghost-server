const MessageSchema = require('./MessageSchema')

// models/Room.js
const mongoose = require('mongoose');
const RoomSchema = new mongoose.Schema({
  latestMessage: {
    type: MessageSchema
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
    latestMessage: MessageSchema,
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