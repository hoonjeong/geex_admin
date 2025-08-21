import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { getTokenFromCookie, verifyToken } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

interface TestInfoRow extends RowDataPacket {
  id: number;
  year: number;
  month: number;
  grade: number;
  info?: string;
}

interface ClassContentRow extends RowDataPacket {
  id: number;
  content: string;
  answer: string;
  question_num: number;
  content_type: string;
  test_id: number;
  insert_time: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = getTokenFromCookie(req);
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: '인증이 필요합니다.' });
  }

  const { year, month, grade } = req.body;

  if (!year || !month || !grade) {
    return res.status(400).json({ error: '년도, 월, 학년 정보가 필요합니다.' });
  }

  const connection = await pool.getConnection();

  try {
    // Check if test_info exists
    const [testInfoRows] = await connection.query<TestInfoRow[]>(
      'SELECT * FROM test_info WHERE year = ? AND month = ? AND grade = ?',
      [year, month, grade]
    );

    let testInfo: TestInfoRow;

    if (testInfoRows.length === 0) {
      // Create new test_info
      const [result] = await connection.query(
        'INSERT INTO test_info (year, month, grade) VALUES (?, ?, ?)',
        [year, month, grade]
      );
      
      testInfo = {
        id: (result as any).insertId,
        year,
        month,
        grade,
        info: null
      } as TestInfoRow;
    } else {
      testInfo = testInfoRows[0];
    }

    // Get class_content for this test_id
    const [contents] = await connection.query<ClassContentRow[]>(
      'SELECT * FROM class_content WHERE test_id = ? ORDER BY question_num',
      [testInfo.id]
    );

    res.status(200).json({
      testInfo,
      contents
    });
  } catch (error) {
    console.error('Error in get-test-info:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  } finally {
    connection.release();
  }
}