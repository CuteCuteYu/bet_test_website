import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    try {
      // 检查用户名是否已存在
      const [existingUsers] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // 创建新用户
      const [result] = await pool.query(
        'INSERT INTO users (username, password, balance, is_admin) VALUES (?, ?, ?, ?)',
        [username, password, 0.00, false]
      );

      res.status(201).json({ message: 'User registered successfully', user_id: result.insertId });
    } catch (error) {
      res.status(500).json({ message: 'Database error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}