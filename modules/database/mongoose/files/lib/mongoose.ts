import mongoose from "mongoose";
import { envVars } from "../config/env";

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

  const uri = envVars.DATABASE_URL;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
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

const getMongoClient = () => {
  if (!mongoose.connection.readyState) {
    throw new Error("MongoDB is not connected. Call mongoose() first.");
  }

  return mongoose.connection.getClient();
};

const getMongoDb = () => {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("MongoDB is not connected. Call mongoose() first.");
  }

  return db;
};

export {
  dbConnect as connectMongoose,
  getMongoClient,
  getMongoDb,
  dbConnect as mongoose,
  dbConnect,
};

