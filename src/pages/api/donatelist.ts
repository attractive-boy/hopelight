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

    // 查询当前用户信息
    const currentUser = await knex('users')
      .select('*')
      .where('id', decoded.userId)
      .first();

    if (!currentUser) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    // 获取推荐人列表
    const inviteUsers = [];

    // 获取直接推荐人
    if (currentUser.invite_code) {
      const directInviter = await knex('users')
        .select('id', 'real_name', 'id_card')
        .where('my_invite_code', currentUser.invite_code)
        .first();
      if (directInviter) {
        inviteUsers.push(directInviter);

        // 获取间接推荐人
        if (directInviter.invite_code) {
          const indirectInviter = await knex('users')
            .select('id', 'real_name', 'id_card')
            .where('my_invite_code', directInviter.invite_code)
            .first();
          if (indirectInviter) {
            inviteUsers.push(indirectInviter);
          }
        }
      }
    }

    // 获取其他优先还款用户
    const priorityUsers = await knex('users')
      .select('id', 'real_name', 'id_card')
      .where('is_priority_repayment', true)
      .whereNot('id', decoded.userId)
      .whereNotIn('id', inviteUsers.map(user => user.id));

    // 合并所有用户列表
    const allUsers = [...inviteUsers, ...priorityUsers];

    return res.status(200).json({
      success: true,
      data: allUsers
    });

  } catch (error) {
    console.error('获取捐赠列表失败:', error);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
}