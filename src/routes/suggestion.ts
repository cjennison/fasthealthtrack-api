// These routes are only for development purposes and are not used in production.
//  They are used to test the API endpoints and invoke functionality.

import { Router } from 'express';
import { Request, Response } from 'express';
import checkRole from './middleware/check-role';
import authenticate from './middleware/authenticate';
import { getFoodItemNamesFromAI } from '../services/food-evaluator';

const router = Router();

// Endpoint to get Food Name suggestions from food-evaluator.ts
router.get('/food-names', authenticate, async (req: Request, res: Response) => {
  const { name } = req.query;
  if (typeof name !== 'string') {
    res.status(400).json({ message: 'Invalid name parameter' });
    return;
  }
  const suggestions = await getFoodItemNamesFromAI(name);
  res.status(200).json(suggestions);
});

export default router;
