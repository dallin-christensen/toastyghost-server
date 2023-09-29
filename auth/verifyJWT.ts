import jwt from 'jsonwebtoken'
const SECRET = process.env.SECRET ?? ''

type DecodedType = string | jwt.JwtPayload | undefined

function verifyJWT(token: string, cb: (decoded: DecodedType) => void) {
    jwt.verify(token, SECRET, (err: Error | null, decoded: DecodedType) => {
        if (err) {
            throw Error('Not authorized')
        } else {
            cb(decoded)
        }
    })
}

export default verifyJWT
