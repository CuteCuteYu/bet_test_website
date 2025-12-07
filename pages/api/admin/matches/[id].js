const pool = require('../../../../lib/db');

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { action } = req.body;

    try {
      if (action === 'lock') {
        // 封盘操作
        console.log('Attempting to lock match:', id);
        console.log('Using action:', action);
        const [result] = await pool.query(
          'UPDATE matches SET status = ? WHERE id = ? AND status = ?',
          ['locked', id, 'pending']
        );
        console.log('Update result:', result);
        res.status(200).json({ message: 'Match locked successfully' });
      } else {
        res.status(400).json({ message: 'Invalid action' });
      }
    } catch (error) {
      console.error('Lock match error:', error);
      res.status(500).json({ message: 'Database error', error: error.message });
    }
  } else if (req.method === 'DELETE') {
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
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}