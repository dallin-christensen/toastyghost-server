import express from 'express'
import jwt from 'jsonwebtoken'
// import ParticipantType from '../models/types/ParticipantType'
const SECRET = process.env.SECRET ?? ''

function expressUserAuth(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) {
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(
            token,
            SECRET,
            (
                err: Error | null
                // decoded: string | jwt.JwtPayload | undefined
            ) => {
                if (err) {
                    return res.status(401).json({ message: 'Not authorized' })
                } else {
                    next()
                }
            }
        )
    } else {
        return res
            .status(401)
            .json({ message: 'Not authorized, token not available' })
    }
}

export default expressUserAuth
