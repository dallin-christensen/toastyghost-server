const RoomSchema = require("./schemas/RoomSchema")
const mongoose = require('mongoose');

const Room = mongoose.model('room', RoomSchema);

module.exports = Room