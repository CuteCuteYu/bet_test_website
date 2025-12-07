const pool = require('../../../../../lib/db');

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { id } = req.query;
    const { winner } = req.body;

    try {
      // 开始事务
      await pool.query('START TRANSACTION');

      // 更新比赛状态和结果
      await pool.query(
        'UPDATE matches SET status = ?, winner = ? WHERE id = ? AND status = ?',
        ['completed', winner, id, 'pending']
      );

      // 获取所有与该比赛相关的押注
      const [bets] = await pool.query(
        'SELECT * FROM bets WHERE match_id = ? AND status = ?',
        [id, 'pending']
      );

      // 处理每个押注
      for (const bet of bets) {
        const { id: betId, user_id, team, amount, odd } = bet;
        let betStatus = 'lost';
        let winnings = 0;

        // 如果押注的队伍获胜，计算 winnings
        if (team === winner) {
          betStatus = 'won';
          winnings = amount * odd;
        }

        // 更新押注状态
        await pool.query(
          'UPDATE bets SET status = ? WHERE id = ?',
          [betStatus, betId]
        );

        // 如果押注获胜，更新用户余额
        if (betStatus === 'won') {
          await pool.query(
            'UPDATE users SET balance = balance + ? WHERE id = ?',
            [winnings, user_id]
          );
        }
      }

      // 提交事务
      await pool.query('COMMIT');

      res.status(200).json({ message: 'Match result processed successfully' });
    } catch (error) {
      // 回滚事务
      await pool.query('ROLLBACK');
      res.status(500).json({ message: 'Database error' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}