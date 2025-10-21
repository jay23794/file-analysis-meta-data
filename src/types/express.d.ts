import { DecodedToken } from '../jwtUtils';

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

export {};