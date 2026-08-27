import mongoose from "mongoose";
import { logger } from "../config/logger";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = globalThis as unknown as {
  mongoose: MongooseCache;
};

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

  const uri = process.env.DATABASE_URL;

  if (!uri) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then(async (mongooseInstance: typeof mongoose) => {
        logger.info("MongoDB connected successfully");
        if (mongoose.connection.db) {
          await mongoose.connection.db.admin().command({ ping: 1 });
          logger.info("Pinged your deployment. You successfully connected to MongoDB!");
        }
        return mongooseInstance;
      })
      .catch((error: Error) => {
        logger.error("MongoDB connection failed", error);
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

export { dbConnect, getMongoClient, getMongoDb };
