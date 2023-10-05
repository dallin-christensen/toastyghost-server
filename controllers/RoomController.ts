import ParticipantType from '../models/types/ParticipantType'
import RoomType from '../models/types/RoomType'
import genRandomNumber from '../utilities/genRandomNumber'
const Room = require('../models/Room')
const mongoose = require('mongoose')

type newRoomPayload = {
    participants: ParticipantType[]
    name: string
}

// create new room
export async function createNewRoom(body: newRoomPayload) {
    const { name, participants } = body

    const x = genRandomNumber(50, 700)
    const y = genRandomNumber(80, 500)

    const participant = {
        ...participants[0],
        x,
        y,
        _id: new mongoose.Types.ObjectId().toHexString(),
    }

    const room = {
        name,
        participants: [participant],
        createdAt: new Date(),
        host: participant._id,
    }

    const createdRoom: RoomType = await Room.create(room)
    return createdRoom
}

export async function getRoom(roomId: string) {
    const room = await Room.findById(roomId).catch(() => {
        throw Error('room does not exist')
    })
    return room
}

// join room
export async function joinRoom(roomId: string, participant: ParticipantType) {
    const room = await Room.findById(roomId).catch(() => {
        throw Error('room does not exist')
    })

    participant.x = genRandomNumber(50, 700)
    participant.y = genRandomNumber(80, 500)

    room.participants = [...room.participants, participant]

    const updatedRoom = await room.save().catch(() => {
        throw Error('could not save room')
    })

    const finalParticipant =
        updatedRoom.participants[updatedRoom.participants.length - 1]

    return { room: updatedRoom, participant: finalParticipant }
}

export async function leaveRoom(roomId: string, participantId: string) {
    const room = await Room.findById(roomId)

    const updatedParticipants = room.participants.filter(
        (p: ParticipantType) => p?._id?.toString() !== participantId
    )

    room.participants = updatedParticipants

    const updatedRoom = await room.save()

    return updatedRoom
}

export async function lookupParticipantInRoom(
    roomId: string,
    participantId: string
) {
    const room = await Room.findById(roomId).catch(() => {
        throw Error('room does not exist')
    })

    const isInRoom = room.participants.some(
        (p: ParticipantType) => p._id?.toString() === participantId
    )

    if (isInRoom) {
        return room
    } else {
        // TODO look at this again, not loving mis-matched return types
        return 'not a participant'
    }
}

// create message
export async function insertLatestMessage(
    roomId: string,
    participantId: string,
    text: string
) {
    //latestMessage
    const latestMessage = {
        _id: new mongoose.Types.ObjectId().toHexString(),
        text,
        participantId,
        insertedAt: Date.now(),
    }

    const room = await Room.findById(roomId)

    room.latestMessage = latestMessage

    const updatedParticipants = room.participants.reduce(
        (acc: ParticipantType[], participant: ParticipantType) => {
            if (participant?._id?.toString() === participantId) {
                return [
                    ...acc,
                    { ...participant, latestMessage: latestMessage },
                ]
            } else {
                return [...acc, participant]
            }
        },
        []
    )

    room.participants = updatedParticipants

    const updatedRoom = await room.save()

    return updatedRoom
}

export async function updateCoordinates(
    roomId: string,
    participantId: string,
    x: number,
    y: number
) {
    const room = await Room.findById(roomId)

    const updatedParticipants = room.participants.reduce(
        (acc: ParticipantType[], participant: ParticipantType) => {
            if (participant?._id?.toString() === participantId) {
                return [...acc, { ...participant, x, y }]
            } else {
                return [...acc, participant]
            }
        },
        []
    )

    room.participants = updatedParticipants

    const updatedRoom = await room.save()

    return updatedRoom
}

// delete room
export async function deleteRoom(roomId: string) {
    const room = await Room.findByIdAndDelete(roomId)
    return room
}
