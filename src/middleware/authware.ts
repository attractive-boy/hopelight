import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/utils/jwt';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    userId: number;
    phone: string;
  };
}

export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ success: false, message: '未授权' });
      }

      const decoded = verifyToken(token);
      req.user = decoded;

      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Token 无效' });
    }
  };
}