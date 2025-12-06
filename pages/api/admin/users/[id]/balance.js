import pool from '../../../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { id } = req.query;
    const { balance } = req.body;

    try {
      await pool.query('UPDATE users SET balance = ? WHERE id = ?', [parseFloat(balance), id]);
      res.status(200).json({ message: 'Balance updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Database error' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}