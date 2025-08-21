import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { getTokenFromCookie, verifyToken } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  status_code: string;
  permission_code: string;
  created_at: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = getTokenFromCookie(req);
  const user = token ? verifyToken(token) : null;

  if (!user) {
    return res.status(401).json({ error: '인증이 필요합니다.' });
  }

  try {
    const connection = await pool.getConnection();
    
    try {
      const [users] = await connection.query<UserRow[]>(
        'SELECT id, email, status_code, permission_code, created_at FROM admin_user WHERE id = ?',
        [user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      }

      const userData = users[0];
      res.status(200).json({ 
        user: {
          id: userData.id,
          email: userData.email,
          status_code: userData.status_code,
          permission_code: userData.permission_code,
          created_at: userData.created_at
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}