import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { IUser, IUserMethods, UserModel } from "./auth.interface";

const SALT_ROUNDS = 10;

/**
 * User Schema definition
 */
const userSchema = new Schema<IUser, UserModel, IUserMethods>({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'Username must be at least 3 characters long'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false, 
    }
}, { 
    timestamps: true,
    versionKey: false,
    toJSON: {
        transform: function(_doc, ret) {
            delete ret.password;
            return ret;
        }
    }
});

/**
 * Password hashing middleware
 */
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

/**
 * Instance method to verify password
 */
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser, UserModel>('User', userSchema);
