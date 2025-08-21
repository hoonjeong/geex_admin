import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { registrationCode } = req.body;

  if (!registrationCode) {
    return res.status(400).json({ error: '회원가입 코드를 입력해주세요.' });
  }

  if (registrationCode !== process.env.ADMIN_REGISTRATION_CODE) {
    return res.status(400).json({ error: '잘못된 회원가입 코드입니다.' });
  }

  try {
    const connection = await pool.getConnection();
    
    try {
      const [users] = await connection.query<RowDataPacket[]>(
        'SELECT email FROM admin_user WHERE status_code = ?',
        ['active']
      );

      const emails = users.map(user => {
        const email = user.email as string;
        const [localPart, domain] = email.split('@');
        const maskedLocal = localPart.substring(0, 2) + '***';
        return `${maskedLocal}@${domain}`;
      });

      res.status(200).json({ 
        message: '등록된 이메일 목록입니다.',
        emails 
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Find email error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}