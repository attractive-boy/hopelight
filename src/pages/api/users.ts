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

    // // 从请求头获取 token
    // const token = req.headers.authorization?.replace('Bearer ', '');
    
    // if (!token) {
    //   return res.status(401).json({ success: false, message: '未授权' });
    // }

    // // 验证 token
    // const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };

    // 如果传入了id,直接返回单个用户信息
    const userId = req.query.id;
    if (userId) {
      const user = await knex('users').where('id', userId).first();
      if (!user) {
        return res.status(404).json({ success: false, message: '用户不存在' });
      }
      return res.status(200).json({
        success: true,
        data: user
      });
    }

    // 获取分页参数
    const current = parseInt(req.query.current as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const offset = (current - 1) * pageSize;
    const startTime = req.query.startTime as string;
    const endTime = req.query.endTime as string;

    // 构建查询
    let query = knex('users');

    // 获取所有可搜索字段
    const searchableFields = [
      'id',
      'phone',
      'invite_code',
      'my_invite_code',
      'real_name',
      'id_card',
      'status',
      'payment_channel',
      'payment_qrcode',
      'total_debt',
      'crowdfunding_account',
      'payment_phone',
      'is_activated',
      'is_priority_repayment'
    ];

    // 添加所有字段的搜索条件
    searchableFields.forEach(field => {
      const value = req.query[field];
      if (value !== undefined && value !== '') {
        if (typeof value === 'string') {
          // 字符串字段使用模糊搜索
          query = query.where(field, 'like', `%${value}%`);
        } else {
          // 数字字段使用精确匹配
          query = query.where(field, '=', value);
        }
      }
    });

    // 添加时间范围搜索
    if (startTime && endTime) {
      query = query.whereBetween('created_at', [startTime, endTime]);
    }

    // 获取总记录数
    const total = await query.clone().count('* as count').first();

    // 获取分页数据
    const users = await query
      .select("*")
      .orderBy('created_at', 'desc')
      .offset(offset)
      .limit(pageSize);

    return res.status(200).json({
      success: true,
      data: users,
      total: total?.count || 0,
      current,
      pageSize
    });

  } catch (error) {
    console.error('获取用户列表失败:', error);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
}