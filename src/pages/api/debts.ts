import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/db';
import jwt, { verify } from 'jsonwebtoken';

interface DebtResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DebtResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    // 从请求头获取token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    console.log("decoded==>", decoded);
    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: '无效的token'
      });
    }

    // 查询用户的所有债务
    const debts = await db('debts')
      .where('user_id', decoded.userId)
      .select('id', 'type', 'amount', 'evidence_url', 'created_at');

    return res.status(200).json({
      success: true,
      data: debts
    });

  } catch (error) {
    console.error('获取债务列表失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
}
