
import ParticipantType from "../models/types/ParticipantType"
import RoomType from "../models/types/RoomType";
const Room = require('../models/Room');
const mongoose = require('mongoose');


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

export async function leaveRoom(roomId: string, participantId: string) {
  const room = await Room.findById(roomId)

  const updatedParticipants = room.participants.filter((p: ParticipantType) => p?._id?.toString() !== participantId)

  room.participants = updatedParticipants

  const updatedRoom = await room.save()

  return updatedRoom
}


// create message
export async function insertLatestMessage(roomId: string, participantId: string, text: string) {
  //latestMessage
  const latestMessage = {
    _id: new mongoose.Types.ObjectId().toHexString(),
    text,
    participantId,
    insertedAt: Date.now()
  }

  console.log({ latestMessage })

  const room = await Room.findById(roomId)

  room.latestMessage = latestMessage

  const updatedParticipants = room.participants.reduce((acc: ParticipantType[], participant: ParticipantType) => {
    if (participant?._id?.toString() === participantId) {
      return [...acc, {...participant, latestMessage: latestMessage}]
    } else {
      return [...acc, participant]
    }
  }, [])

  room.participants = updatedParticipants

  const updatedRoom = await room.save()

  return updatedRoom
}


// delete room
export async function deleteRoom(roomId: string) {
  const room = await Room.findByIdAndDelete(roomId)
  return room
}

// 