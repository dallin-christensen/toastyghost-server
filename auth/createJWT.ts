import ParticipantType from '../models/types/ParticipantType'
const jwt = require('jsonwebtoken')
const SECRET = process.env.SECRET ?? ''

function createJWT(participant: ParticipantType) {
    const token = jwt.sign(JSON.stringify(participant), SECRET)

    return token
}

export default createJWT
