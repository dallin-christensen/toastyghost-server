import MessageType from './MessageType'
import { Types } from 'mongoose'

type ParticipantType = {
    _id?: Types.ObjectId
    avatar: string
    handle: string
    latestMessage?: MessageType
    x: number
    y: number
}

export default ParticipantType
