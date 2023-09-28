import jwt from 'jsonwebtoken'
import ParticipantType from '../models/types/ParticipantType';
const SECRET = process.env.SECRET ?? ""

function createJWT(participant: ParticipantType) {
  const maxAge = 24 * 60 * 60 * 1000; // 24 hrs in ms
  const token = jwt.sign(
    participant,
    SECRET,
    {
      expiresIn: maxAge,
    }
  );

  return token
}

export default createJWT