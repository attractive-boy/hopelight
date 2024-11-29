import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: '缺少图片 URL 参数' });
  }

  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');

    // 设置响应头
    res.setHeader('Content-Type', contentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // 将图片数据流式传输到客户端
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('代理图片请求失败:', error);
    res.status(500).json({ error: '代理图片请求失败' });
  }
}