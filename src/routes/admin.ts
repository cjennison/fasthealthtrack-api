import { Router } from 'express';
import { Request, Response } from 'express-serve-static-core';

import checkRole from './middleware/check-role';
import authenticate from './middleware/authenticate';

const router = Router();

export default router;
