import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/db';
import jwt, { verify } from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    // 从请求头获取token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    // 验证token
    const decoded = verify(token, process.env.JWT_SECRET as string) as { userId: number };
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'token无效' });
    }

    // 更新用户激活状态
    await db('users')
      .where('id', decoded.userId)
      .update({
        is_activated: 1,
        activated_at: db.fn.now() // 记录激活时间
      });

    return res.json({ success: true });
  } catch (error) {
    console.error('激活失败:', error);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
}




