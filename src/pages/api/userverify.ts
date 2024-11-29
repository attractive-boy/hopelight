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
    // 从请求头获取 token
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    // 验证 token
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    console.log("body==>", req.body);

    const { name, idCard } = req.body;
    
    // 验证数据
    if (!name || !idCard) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }

    // 验证身份证格式
    const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (!idCardRegex.test(idCard)) {
      return res.status(400).json({ success: false, message: '身份证格式不正确' });
    }

    // 更新用户信息
    await knex('users')
      .where('id', decoded.userId)
      .update({
        real_name: name,
        id_card: idCard,
        updated_at: knex.fn.now()
      });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('实名认证失败:', error);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
}