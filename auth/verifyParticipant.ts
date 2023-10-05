import verifyJWT from './verifyJWT'
import { parse } from 'cookie'
import jwt from 'jsonwebtoken'
import ParticipantType from '../models/types/ParticipantType'

type cookieType = {
    jwt: string
}

function verifyParticipant(
    cookie: string | cookieType,
    participantId: string,
    successCb: (decoded: ParticipantType) => void,
    failCb: (msg: string) => void
) {
    const verifyCb = async (decoded: string | jwt.JwtPayload | undefined) => {
        const decodedToken = decoded as ParticipantType
        if (decodedToken?._id ?? '' === participantId) {
            successCb(decodedToken)
        } else {
            failCb('unauthorized')
        }
    }

    if (cookie) {
        if (typeof cookie === 'string') {
            const cookies = parse(cookie)
            if (cookies.jwt) {
                verifyJWT(cookies.jwt, verifyCb)
            } else {
                failCb('unauthorized')
            }
        } else {
            verifyJWT(cookie.jwt, verifyCb)
        }
    } else {
        failCb('unauthorized')
    }
}

export default verifyParticipant
