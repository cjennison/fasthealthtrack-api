import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

/**
 * Ownership middleware to verify that the requesting user owns the resource.
 *
 * @param model - The Mongoose model to query the resource.
 * @param userIdField - The field in the resource document that references the user's ID.
 */
const checkOwnership = (
  model: mongoose.Model<any>,
  modelIdField: string,
  userIdField: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params[modelIdField]; // Assuming resource ID is passed as a route param
      const resource = await model.findById(id);

      if (!resource) {
        res.status(404).json({ message: 'Resource not found' });
        return;
      }

      if (resource[userIdField].toString() !== req.body.userId) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      next(); // Ownership verified, proceed to the next middleware/handler
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error });
    }
  };
};

export default checkOwnership;
