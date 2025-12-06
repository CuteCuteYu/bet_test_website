const pool = require('../../lib/db');
const { verifySession } = require('../../lib/session');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // 从会话中获取用户ID
    const user_id = await verifySession(req);
    
    if (!user_id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const [rows] = await pool.query('SELECT username, balance FROM users WHERE id = ?', [user_id]);

      if (rows.length > 0) {
        res.status(200).json({
          username: rows[0].username,
          balance: parseFloat(rows[0].balance)
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Database error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}