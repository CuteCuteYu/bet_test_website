import pool from '../../../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query;

    try {
      const [rows] = await pool.query(
        `SELECT bets.*, matches.match_name, matches.team1, matches.team2 
         FROM bets 
         JOIN matches ON bets.match_id = matches.id 
         WHERE bets.user_id = ? 
         ORDER BY bets.created_at DESC`,
        [id]
      );

      // 转换金额和赔率为数字类型
      const bets = rows.map(bet => ({
        ...bet,
        amount: parseFloat(bet.amount),
        odd: parseFloat(bet.odd)
      }));

      res.status(200).json(bets);
    } catch (error) {
      res.status(500).json({ message: 'Database error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}