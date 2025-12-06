import pool from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { id } = req.query;

    try {
      // 开始事务
      await pool.query('START TRANSACTION');

      // 首先删除相关的押注记录
      await pool.query('DELETE FROM bets WHERE match_id = ?', [id]);

      // 然后删除比赛记录
      await pool.query('DELETE FROM matches WHERE id = ?', [id]);

      // 提交事务
      await pool.query('COMMIT');

      res.status(200).json({ message: 'Match deleted successfully' });
    } catch (error) {
      // 回滚事务
      await pool.query('ROLLBACK');
      res.status(500).json({ message: 'Database error' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}