import { Model, HydratedDocument } from "mongoose";

/**
 * Core User attributes
 */
export interface IUser {
    username: string;
    email: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Instance methods for the User document
 */
export interface IUserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * Full User model type including statics if needed
 */
export type UserModel = Model<IUser, {}, IUserMethods>;

/**
 * Typed Mongoose Document for the User
 */
export type TUser = HydratedDocument<IUser, IUserMethods>;
