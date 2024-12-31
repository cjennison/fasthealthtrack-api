import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Middleware to verify token and extract userId
const authenticate = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: 'Authorization header missing' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    req.body.userId = decoded.userId;
    req.body.role = decoded.role;

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export default authenticate;
