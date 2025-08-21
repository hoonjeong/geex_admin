import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { getTokenFromCookie, verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = getTokenFromCookie(req);
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: '인증이 필요합니다.' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: '삭제할 컨텐츠 ID가 필요합니다.' });
  }

  const connection = await pool.getConnection();

  try {
    // 컨텐츠 삭제
    const [result] = await connection.query(
      'DELETE FROM class_content WHERE id = ?',
      [id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: '컨텐츠를 찾을 수 없습니다.' });
    }

    res.status(200).json({ message: '컨텐츠가 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  } finally {
    connection.release();
  }
}