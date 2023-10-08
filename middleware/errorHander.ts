import { NextFunction, Response, Request } from 'express'

const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err.message === 'room does not exist') {
        res.status(404).send({ errors: [{ message: err.message, err }] })
    } else {
        res.status(500).send({ errors: [{ message: 'Something went wrong', err }] })
    }
    next(err)
}

export default errorHandler
