import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, registrationCode, newPassword, confirmNewPassword } = req.body;

  if (!email || !registrationCode || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
  }

  if (registrationCode !== process.env.ADMIN_REGISTRATION_CODE) {
    return res.status(400).json({ error: '잘못된 회원가입 코드입니다.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: '비밀번호는 최소 8자 이상이어야 합니다.' });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ error: '비밀번호가 일치하지 않습니다.' });
  }

  try {
    const connection = await pool.getConnection();
    
    try {
      const [users] = await connection.query<RowDataPacket[]>(
        'SELECT id FROM admin_user WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: '등록되지 않은 이메일입니다.' });
      }

      const hashedPassword = await hashPassword(newPassword);

      await connection.query(
        'UPDATE admin_user SET password = ? WHERE email = ?',
        [hashedPassword, email]
      );

      res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}