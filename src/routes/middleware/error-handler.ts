import { Request, Response, NextFunction } from 'express';
import ContentModerationError from '../../errors/ContentModerationError';

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ContentModerationError) {
    res.status(err.statusCode).json(err.toJSON());
  } else {
    console.error(err); // Log unexpected errors for debugging
    let message = err.message || 'Internal Server Error';
    res.status(500).json({ message });
  }
};

export default errorHandler;
