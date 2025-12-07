const pool = require('../../lib/db');
const { verifySession } = require('../../lib/session');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // 从会话中获取用户ID
      const user_id = await verifySession(req);
      
      if (!user_id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const [rows] = await pool.query(
        `SELECT bets.*, matches.match_name, matches.team1, matches.team2, matches.status as match_status, matches.winner
         FROM bets 
         JOIN matches ON bets.match_id = matches.id 
         WHERE bets.user_id = ? 
         ORDER BY bets.created_at DESC`,
        [user_id]
      );

      // 转换金额和赔率为数字类型
      const bets = rows.map(bet => ({
        ...bet,
        amount: parseFloat(bet.amount),
        odd: parseFloat(bet.odd)
      }));

      res.status(200).json(bets);
    } catch (error) {
      console.error('Error fetching bets:', error);
      res.status(500).json({ message: 'Database error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}