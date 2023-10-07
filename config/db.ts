import mongoose from 'mongoose'
const mongoUrl = process.env.MONGO_URL as string

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUrl)
        console.log('MongoDB is Connected...')
    } catch (err) {
        if (err instanceof Error) console.error(err.message)
        process.exit(1)
    }
}

export default connectDB
