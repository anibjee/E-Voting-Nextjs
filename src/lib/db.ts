import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL || process.env.MONGODB_URL_LOCAL || 'mongodb://localhost:27017/voting';

if (!MONGODB_URL) {
  throw new Error(
    'Please define the MONGODB_URL or MONGODB_URL_LOCAL environment variable inside .env.local'
  );
}

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: CachedConnection | undefined;
}

const cached: CachedConnection = (globalThis as any).mongoose || { conn: null, promise: null };

if (!(globalThis as any).mongoose) {
  (globalThis as any).mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URL, opts).then((mongoose) => {
      console.log('Connected to MongoDB');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
