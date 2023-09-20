const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  },
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
});

export default MessageSchema