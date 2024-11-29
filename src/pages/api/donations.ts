import type { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';
import knex from '@/db';

interface DonationBody {
  userId: string;
  paymentProof: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 处理GET请求 - 查询捐赠记录
  if (req.method === 'GET') {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '缺少用户ID'
        });
      }

      const donations = await knex('donations')
        .select([
          'donations.*',
          'users.real_name as user_real_name',
          'users.id_card as user_id_card'
        ])
        .leftJoin('users', 'donations.user_id', 'users.id')
        .where('submitter_id', userId)
        .orderBy('donations.created_at', 'desc');

      return res.status(200).json({
        success: true,
        data: donations
      });

    } catch (error) {
      console.error('获取捐赠记录失败:', error);
      return res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  }

  // 处理POST请求 - 提交捐赠
  if (req.method === 'POST') {
    try {
      // 从请求头获取 token
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ success: false, message: '未授权' });
      }

      // 验证 token
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
      
      const { userId, paymentProof } = req.body as DonationBody;

      // 验证必填字段
      if (!userId || !paymentProof) {
        return res.status(400).json({ 
          success: false, 
          message: '缺少必要参数' 
        });
      }

      // 创建捐赠记录
      await knex('donations').insert({
        user_id: userId,
        payment_proof: paymentProof,
        created_at: new Date(),
        submitter_id: decoded.userId, // 添加提交人ID
      });

      return res.status(200).json({
        success: true,
        message: '捐赠提交成功'
      });

    } catch (error) {
      console.error('捐赠提交失败:', error);
      return res.status(500).json({ 
        success: false, 
        message: '服务器错误' 
      });
    }
  }

  return res.status(405).json({ success: false, message: '方法不允许' });
}