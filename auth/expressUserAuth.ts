import express from 'express'
import jwt from 'jsonwebtoken'
const SECRET = process.env.SECRET ?? ""

function expressUserAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.cookies.jwt
  if (token) {
    jwt.verify(token, SECRET, (err: Error | null) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" })
      } else {
        next()
        // if (decodedToken.role !== "Basic") {
        //   return res.status(401).json({ message: "Not authorized" })
        // } else {
        //   next()
        // }
      }
    })
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized, token not available" })
  }
}

export default expressUserAuth