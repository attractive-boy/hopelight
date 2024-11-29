import type { NextApiRequest, NextApiResponse } from 'next';
import knex from '@/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {


    const { userId, isPriority } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: '缺少用户ID' });
    }

    // 更新用户优先还款状态
    await knex('users')
      .where('id', userId)
      .update({
        is_priority_repayment: isPriority ? 1 : 0,
        priority_set_at: isPriority ? knex.fn.now() : null
      });

    return res.status(200).json({
      success: true,
      message: '更新成功'
    });

  } catch (error) {
    console.error('修改优先还款状态失败:', error);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
}