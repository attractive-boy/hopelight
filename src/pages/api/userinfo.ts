import type { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';
import knex from '@/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    // 从请求头获取 token
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    // 验证 token
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    console.log("decoded==>", decoded);
    // 查询用户信息
    const user = await knex('users')
      .select('*')
      .where('id', decoded.userId)
      .first();
    console.log("user==>", user);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('获取用户信息失败:', error);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
}