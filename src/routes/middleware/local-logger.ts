import { Request, Response } from 'express-serve-static-core';

const log = (req: Request, res: Response, next: Function) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

export default log;
