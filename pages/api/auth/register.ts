import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, confirmPassword, registrationCode } = req.body;

  if (!email || !password || !confirmPassword || !registrationCode) {
    return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: '유효한 이메일 주소를 입력해주세요.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: '비밀번호는 최소 8자 이상이어야 합니다.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: '비밀번호가 일치하지 않습니다.' });
  }

  if (registrationCode !== process.env.ADMIN_REGISTRATION_CODE) {
    return res.status(400).json({ error: '잘못된 회원가입 코드입니다.' });
  }

  try {
    const connection = await pool.getConnection();
    
    try {
      const [existingUser] = await connection.query<RowDataPacket[]>(
        'SELECT id FROM admin_user WHERE email = ?',
        [email]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ error: '이미 등록된 이메일입니다.' });
      }

      const hashedPassword = await hashPassword(password);

      await connection.query(
        'INSERT INTO admin_user (email, password, status_code, permission_code) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, 'active', 'admin']
      );

      res.status(201).json({ message: '회원가입이 완료되었습니다.' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}