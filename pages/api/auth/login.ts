import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password: string;
  status_code: string;
  permission_code: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, rememberEmail } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
  }

  try {
    const connection = await pool.getConnection();
    
    try {
      const [users] = await connection.query<UserRow[]>(
        'SELECT id, email, password, status_code, permission_code FROM admin_user WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      }

      const user = users[0];

      if (user.status_code !== 'active') {
        return res.status(401).json({ error: '비활성화된 계정입니다.' });
      }

      const isPasswordValid = await verifyPassword(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        permission_code: user.permission_code
      });

      setAuthCookie(res, token);

      res.status(200).json({ 
        message: '로그인 성공',
        user: {
          id: user.id,
          email: user.email,
          permission_code: user.permission_code
        },
        rememberEmail: rememberEmail ? email : null
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}