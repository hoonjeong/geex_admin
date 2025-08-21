import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { getTokenFromCookie, verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = getTokenFromCookie(req);
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: '인증이 필요합니다.' });
  }

  const { id, content, answer, question_num, content_type } = req.body;

  if (!id || !content || !question_num || !content_type) {
    return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.query(
      'UPDATE class_content SET content = ?, answer = ?, question_num = ?, content_type = ? WHERE id = ?',
      [content, answer || '', question_num, content_type, id]
    );

    res.status(200).json({ message: '수정되었습니다.' });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  } finally {
    connection.release();
  }
}