// These routes are only for development purposes and are not used in production.
//  They are used to test the API endpoints and invoke functionality.

import { Router } from 'express';
import { Request, Response } from 'express';
import checkRole from './middleware/check-role';
import authenticate from './middleware/authenticate';

const router = Router();

export default router;
