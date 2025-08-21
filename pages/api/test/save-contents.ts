import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { getTokenFromCookie, verifyToken } from '@/lib/auth';

interface ContentData {
  content: string;
  answer: string;
  question_num: number;
  content_type: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = getTokenFromCookie(req);
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: '인증이 필요합니다.' });
  }

  const { test_id, contents } = req.body;

  if (!test_id || !contents || !Array.isArray(contents) || contents.length === 0) {
    return res.status(400).json({ error: '저장할 컨텐츠가 없습니다.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    for (const content of contents as ContentData[]) {
      await connection.query(
        'INSERT INTO class_content (content, answer, question_num, content_type, test_id, insert_time) VALUES (?, ?, ?, ?, ?, NOW())',
        [content.content, content.answer || '', content.question_num, content.content_type, test_id]
      );
    }

    await connection.commit();

    res.status(200).json({ 
      message: `${contents.length}개의 컨텐츠가 저장되었습니다.`,
      count: contents.length 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error saving contents:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  } finally {
    connection.release();
  }
}