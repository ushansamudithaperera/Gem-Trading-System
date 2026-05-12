import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, DEFAULT_ROLES } from '../models/User.model';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

const generateToken = (userId: string): string => {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as unknown as SignOptions['expiresIn'] };
  return jwt.sign({ userId }, env.JWT_SECRET, options);
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phone, roles } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'Email already exists');
  }

  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phone,
    roles: roles || DEFAULT_ROLES,
  });

  const token = generateToken(user._id as string);

  logger.info(`New user registered: ${email} with roles ${user.roles}`);

  res.status(201).json(
    new ApiResponse(201, {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
      token,
    }, 'User registered successfully')
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = generateToken(user._id as string);

  logger.info(`User logged in: ${email}`);

  res.json(
    new ApiResponse(200, {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        avatar: user.avatar,
      },
      token,
    }, 'Login successful')
  );
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new ApiError(401, 'Not authenticated');
  res.json(new ApiResponse(200, user, 'User profile retrieved'));
});