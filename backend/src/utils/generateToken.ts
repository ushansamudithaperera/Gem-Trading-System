import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export const generateToken = (userId: string): string => {
  const options: SignOptions = { expiresIn: '1h' };
  return jwt.sign({ userId }, env.JWT_SECRET, options);
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, env.JWT_SECRET) as { userId: string };
};