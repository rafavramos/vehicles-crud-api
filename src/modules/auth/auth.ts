import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');

declare global {
    namespace Express {
      interface Request {
        userId?: string;
      }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido' });
  }

  jwt.verify(token, 'seu_token_secreto', (err: any, user: any) => {
    if (err) {
      return res.status(401).json({ message: 'Token de autenticação inválido' });
    }
    req.userId = user.userId;
    next();
  });
};