import type { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';
import knex from '@/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    // 验证 token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { payment_channel, payment_phone, qrcode } = req.body;

    // 验证必填字段
    if (!payment_channel || !qrcode || !payment_phone) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要参数' 
      });
    }

    // 更新用户的支付信息
    await knex('users')
      .where('id', decoded.userId)
      .update({
        payment_channel,
        payment_qrcode: qrcode,
        payment_phone
      });

    return res.status(200).json({
      success: true,
      message: '设置成功',
    });
  } catch (error) {
    console.error('设置支付信息错误:', error);
    return res.status(500).json({ 
      success: false, 
      message: '设置失败' 
    });
  }
}