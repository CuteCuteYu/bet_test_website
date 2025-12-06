const pool = require('../../lib/db');
const { verifySession } = require('../../lib/session');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { match_id, team, amount } = req.body;
    
    // 从会话中获取用户ID
    const user_id = await verifySession(req);
    
    if (!user_id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      // 开始事务
      await pool.query('START TRANSACTION');

      // 检查用户余额
      const [userRows] = await pool.query('SELECT balance FROM users WHERE id = ? FOR UPDATE', [user_id]);
      if (userRows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ message: 'User not found' });
      }

      const currentBalance = userRows[0].balance;
      if (currentBalance < amount) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      // 获取比赛信息
      const [matchRows] = await pool.query('SELECT * FROM matches WHERE id = ? AND status = ?', [match_id, 'pending']);
      if (matchRows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ message: 'Match not found or completed' });
      }

      const match = matchRows[0];
      const odd = team === 'team1' ? match.odd1 : match.odd2;

      // 扣除用户余额
      const newBalance = currentBalance - amount;
      await pool.query('UPDATE users SET balance = ? WHERE id = ?', [newBalance, user_id]);

      // 记录押注
      await pool.query(
        'INSERT INTO bets (user_id, match_id, team, amount, odd) VALUES (?, ?, ?, ?, ?)',
        [user_id, match_id, team, amount, odd]
      );

      // 提交事务
      await pool.query('COMMIT');

      res.status(200).json({ message: 'Bet placed successfully', new_balance: parseFloat(newBalance) });
    } catch (error) {
      await pool.query('ROLLBACK');
      res.status(500).json({ message: 'Database error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}