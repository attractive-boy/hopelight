import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { verify } from 'jsonwebtoken';

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      multiples: false,
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

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
    verify(token, process.env.JWT_SECRET!);

    const { files } = await parseForm(req);
    const file = files.file;

    if (!file || (Array.isArray(file) && file.length === 0) || (!Array.isArray(file) && !('filepath' in file))) {
      return res.status(400).json({ success: false, message: '没有文件上传' });
    }

    const fileInfo = Array.isArray(file) ? file[0] : file;
    const fileUrl = `/uploads/${path.basename(fileInfo.filepath)}`;

    return res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
      },
    });
  } catch (error) {
    console.error('文件上传错误:', error);
    return res.status(500).json({ success: false, message: '文件上传失败' });
  }
}