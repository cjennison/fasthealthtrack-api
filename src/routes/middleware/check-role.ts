import { Request, Response } from 'express';

const checkRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: Function) => {
    const { role } = req.body;
    const roles = ['guest', 'standard', 'premium', 'admin'];
    if (roles.indexOf(role) < roles.indexOf(requiredRole)) {
      res
        .status(403)
        .json({ message: `Access denied. Requires ${requiredRole} role.` });
      return;
    }
    next();
  };
};

export default checkRole;
