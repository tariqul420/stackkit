import { Request, Response } from 'express';
import status from 'http-status';
import { z } from 'zod';
import { User } from './auth.model';
import { catchAsync } from '../../shared/utils/catch-async';
import { sendResponse } from '../../shared/utils/send-response';
import ApiError from '../../shared/errors/api-error';
import { TUser } from './auth.interface';

/**
 * Validation schema for registration
 */
const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * Validation schema for login
 */
const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = catchAsync(async (req: Request, res: Response) => {
    const validatedData = registerSchema.parse(req.body);
    const { username, email, password } = validatedData;

    const existingUser = await User.findOne({
        $or: [
            { email: email.toLowerCase() },
            { username: username.toLowerCase() }
        ],
    });

    if (existingUser) {
        const field = existingUser.email === email.toLowerCase() ? 'Email' : 'Username';
        throw new ApiError(status.CONFLICT, `${field} is already registered`);
    }

    const newUser: TUser = await User.create({
        username,
        email,
        password,
    });

    sendResponse(res, {
        status: status.CREATED,
        success: true,
        message: 'User registered successfully',
        data: {
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            createdAt: newUser.createdAt,
        },
    });
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password') as TUser | null;

    if (!user || !(await user.comparePassword(password))) {
        throw new ApiError(status.UNAUTHORIZED, 'Invalid email or password');
    }

    sendResponse(res, {
        status: status.OK,
        success: true,
        message: 'Logged in successfully',
        data: {
            _id: user._id,
            username: user.username,
            email: user.email,
        },
    });
});
