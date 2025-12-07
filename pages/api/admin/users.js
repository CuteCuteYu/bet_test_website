const pool = require('../../../lib/db');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { username } = req.query;
      let query = 'SELECT * FROM users';
      let params = [];
      
      if (username) {
        query += ' WHERE username = ?';
        params.push(username);
      }
      
      query += ' ORDER BY id ASC';
      
      const [rows] = await pool.query(query, params);
      // 转换 balance 为数字类型
      const users = rows.map(user => ({
        ...user,
        balance: parseFloat(user.balance)
      }));
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Database error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}