import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/db';
import bcrypt from 'bcryptjs';

interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    phone: string;
    myInviteCode: string;
  };
}

// 生成随机邀请码
async function generateUniqueInviteCode(db: any): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const existingCode = await db('users').where({ my_invite_code: code }).first();
    
    if (!existingCode) {
      return code;
    }
    
    attempts++;
  }
  
  throw new Error('无法生成唯一邀请码');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { phone, password, inviteCode } = req.body;

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: '手机号格式不正确' });
    }

    // 验证密码长度
    if (password.length < 6 || password.length > 20) {
      return res.status(400).json({ success: false, message: '密码长度必须在6-20位之间' });
    }

    // 检查手机号是否已注册
    const existingUser = await db('users').where({ phone }).first();
    if (existingUser) {
      return res.status(400).json({ success: false, message: '该手机号已注册' });
    }

    // 验证邀请码
    const inviter = await db('users').where({ my_invite_code: inviteCode }).first();
    if (!inviter) {
      return res.status(400).json({ success: false, message: '无效的邀请码' });
    }

    // 生成用户自己的邀请码
    const myInviteCode = await generateUniqueInviteCode(db);

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 开启事务
    await db.transaction(async (trx: any) => {
      // 创建用户
      const [userId] = await trx('users').insert({
        phone,
        password: hashedPassword,
        invite_code: inviteCode,
        my_invite_code: myInviteCode,
        status: 0
      });


      return res.status(200).json({
        success: true,
        message: '注册成功',
        data: {
          id: userId,
          phone,
          myInviteCode
        }
      });
    });

  } catch (error) {
    console.error('注册失败:', error);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
}