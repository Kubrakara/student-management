import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface IJwtPayload {
  userId: string;
  role: 'admin' | 'student';
}

export interface IRequest extends Request {
  user?: IJwtPayload;
}

const authMiddleware = (req: IRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //console.log('Auth header:', req.headers.authorization);
    return res.status(401).json({ message: 'Kimlik doğrulama tokenı eksik veya geçersiz.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as IJwtPayload;
    
    req.user = payload;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Yetkilendirme tokenı geçersiz.' });
  }
};

export const authorizeRoles = (...roles: Array<'admin' | 'student'>) => {
  return (req: IRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bu işleme yetkiniz yok.' });
    }
    next();
  };
};

export default authMiddleware;