import MessageType from './MessageType'

type ParticipantType = {
  _id?: string
  avatar: string
  handle: string
  latestMessage?: MessageType
}

export default ParticipantType