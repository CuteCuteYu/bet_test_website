const pool = require('../../lib/db');
const { createSession } = require('../../lib/session');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);

      if (rows.length > 0) {
        const user = rows[0];
        // 创建会话
        await createSession(user.id, res);

        res.status(200).json({
          id: user.id,
          username: user.username,
          is_admin: user.is_admin,
          balance: user.balance,
        });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Database error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}