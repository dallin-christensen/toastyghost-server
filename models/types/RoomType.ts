import ParticipantType from "./ParticipantType"
import MessageType from "./MessageType"

type RoomType = {
  _id: string
  participants: ParticipantType[]
  name: string
  host: string
  startedAt: Date
  latestMessage?: MessageType
}

export default RoomType