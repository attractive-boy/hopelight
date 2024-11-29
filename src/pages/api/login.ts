import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/utils/jwt';

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: number;
      phone: string;
      myInviteCode: string;
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { phone, password } = req.body;

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: '手机号格式不正确' });
    }

    // 查找用户
    const user = await db('users').where({ phone }).first();
    if (!user) {
      return res.status(400).json({ success: false, message: '用户不存在' });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ success: false, message: '密码错误' });
    }

    // 检查用户状态
    if (user.status !== 1) {
      //判断注册时间是否超过24小时
      const registerTime = new Date(user.created_at).getTime();
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - registerTime;
      const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
      if (hoursDifference > 24) {
        //超过24小时，注销删除用户
        await db('users').where({ id: user.id }).delete();
        return res.status(400).json({ success: false, message: '账号已注销' });
      }
    }

    // 生成 token
    const token = signToken({ userId: user.id, phone: user.phone });

    return res.status(200).json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          myInviteCode: user.my_invite_code
        }
      }
    });

  } catch (error) {
    console.error('登录失败:', error);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
}