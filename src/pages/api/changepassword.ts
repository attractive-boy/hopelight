import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { oldPassword, newPassword } = req.body;

    // 参数验证
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: '请提供旧密码和新密码' 
      });
    }

    // 新密码验证规则（可根据需求调整）
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '新密码长度不能小于6位'
      });
    }

    // 查询当前管理员
    const admin = await db('admin')
      .where('username', 'admin')
      .first();

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: '管理员账户不存在'
      });
    }

    // 验证旧密码
    if (oldPassword !== admin.password) {
      return res.status(401).json({
        success: false,
        message: '旧密码错误'
      });
    }

    // 更新密码
    await db('admin')
      .where('username', 'admin')
      .update({
        password: newPassword,
        updated_at: db.fn.now()
      });

    return res.json({
      success: true,
      message: '密码修改成功'
    });

  } catch (error) {
    console.error('修改密码失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
}