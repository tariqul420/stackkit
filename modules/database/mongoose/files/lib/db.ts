import mongoose from "mongoose";
import { ServerApiVersion } from "mongodb";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = globalThis as unknown as {
  mongoose: MongooseCache;
};

// Initialize the cache if not already present
const cached = globalWithMongoose.mongoose || {
  conn: null,
  promise: null,
};

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.DATABASE_URL as string;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then(async (mongooseInstance: typeof mongoose) => {
        console.info("MongoDB connected successfully");
        if (mongoose.connection.db) {
          await mongoose.connection.db.admin().command({ ping: 1 });
          console.info("Pinged your deployment. You successfully connected to MongoDB!");
        }
        return mongooseInstance;
      })
      .catch((error: Error) => {
        console.error("MongoDB connection failed", { error });
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default dbConnect;