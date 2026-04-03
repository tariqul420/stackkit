import status from "http-status";
import { Types } from "mongoose";
import { getMongoDb, mongoose } from "../../database/mongoose";
import { AppError } from "../../shared/errors/app-error";

export type AuthUser = {
  id: string;
  role: string;
  name: string;
  email: string;
  status?: string;
  isDeleted?: boolean;
  emailVerified?: boolean;
  needPasswordChange?: boolean;
  deletedAt?: Date | null;
};

export type AuthUserDocument = AuthUser & {
  createdAt?: Date;
  updatedAt?: Date;
};

export type AuthSessionDocument = {
  token: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt?: Date;
};

export type AuthVerificationDocument = {
  identifier: string;
  value: string;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export const getAuthCollections = async () => {
  await mongoose();

  try {
    const db = getMongoDb();

    return {
      users: db.collection<AuthUserDocument>("user"),
      sessions: db.collection<AuthSessionDocument>("session"),
      verifications: db.collection<AuthVerificationDocument>("verification"),
    };
  } catch {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Auth database is not initialized",
    );
  }
};

export const deleteAuthUserById = async (id: string) => {
  const { users } = await getAuthCollections();
  await users.deleteOne({ _id: new Types.ObjectId(id) });
};
