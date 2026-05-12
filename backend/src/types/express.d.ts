import { IUser } from './user.types';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// This file is needed to extend Express Request type with our `user` property
export {};