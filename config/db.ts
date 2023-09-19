import mongoose from 'mongoose'
import config from 'config'
const db = config.get('mongoURI') as string;

const connectDB = async () => {
  try {
    await mongoose.connect(db);
    console.log('MongoDB is Connected...');
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB