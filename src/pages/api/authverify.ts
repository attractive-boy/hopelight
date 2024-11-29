import { NextApiRequest, NextApiResponse } from 'next';
import { sign } from 'jsonwebtoken';
import db from '@/db';

interface AdminUser {
  id: number;
  username: string;
  password: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { password } = req.body;

    // 从数据库查询管理员账户
    const admin = await db<AdminUser>('admin')
      .where('username', 'admin')
      .first();

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: '管理员账户不存在'
      });
    }

    // 明文密码比对
    if (password === admin.password) {
      // 生成JWT token
      const token = sign(
        { userId: admin.id, username: admin.username },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      return res.json({ 
        success: true,
        token
      });
    }

    return res.status(401).json({
      success: false, 
      message: '密码错误'
    });

  } catch (error) {
    console.error('验证失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
}