import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import authConfig from '../config/auth';

export default function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Missing token' });
  }
  const [, token] = authHeader.split(' ');

  try {
    const decodedToken = jwt.verify(token, authConfig.jwt.secret);

    console.log(decodedToken);

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
