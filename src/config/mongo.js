import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const FALLBACK_ATLAS_URI = 'mongodb+srv://kalpaknarkhede:Kalpak123@mentorsphere-cluster.t1lfehp.mongodb.net/campusnoa?retryWrites=true&w=majority&appName=mentorsphere-cluster';
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || (process.env.NODE_ENV === 'production' ? FALLBACK_ATLAS_URI : 'mongodb://127.0.0.1:27017/campusnoa');

let isConnected = false;

export async function connectMongo() {
  if (isConnected) return mongoose.connection;

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });
    isConnected = true;
    console.log(`🍃 Connected to MongoDB: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    throw err;
  }
}

export default mongoose;
