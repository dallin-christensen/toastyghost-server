
import ParticipantType from "../models/types/ParticipantType"
import RoomType from "../models/types/RoomType";
const Room = require('../models/Room');


type newRoomPayload = {
  participants: ParticipantType[]
  name: string
}
// create new room
export async function createNewRoom(body: newRoomPayload) {
  const room: RoomType = await Room.create(body)
  return room
}


// join room
export async function joinRoom(roomId: string, participant: ParticipantType) {
  const room = await Room.findById(roomId)

  room.participants = [
    ...room.participants,
    participant
  ]

  const updatedRoom = await room.save()

  return updatedRoom
}


// create message


// delete room
export async function deleteRoom(roomId: string) {
  const room = await Room.findByIdAndDelete(roomId)
  return room
}

// 