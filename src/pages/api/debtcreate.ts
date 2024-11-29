import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/db';
import jwt, { verify } from 'jsonwebtoken';

interface DebtCreateRequest {
  type: number;
  amount: number;
  evidence_url: string;
}

interface DebtCreateResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DebtCreateResponse>
) {
  if (req.method !== 'POST') {
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

    const { type, amount, evidence_url } = req.body as DebtCreateRequest;

    // 验证必填字段
    if (!type || !amount || !evidence_url) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 验证金额是否为正数
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '金额必须大于0'
      });
    }

    // 将债务信息存入数据库
    const [debtId] = await db('debts').insert({
      user_id: decoded.userId,
      type,
      amount,
      evidence_url,
      created_at: db.fn.now(),
      updated_at: db.fn.now()
    });

    const debt = await db('debts').where('id', debtId).first();

    //汇总所有的债务到用户表中
    await db('users').where('id', decoded.userId).update({
      total_debt: db.raw('total_debt + ?', [amount])
    });

    return res.status(200).json({
      success: true,
      data: debt
    });

  } catch (error) {
    console.error('创建债务失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
}
