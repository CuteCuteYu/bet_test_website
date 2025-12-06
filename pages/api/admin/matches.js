import pool from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM matches ORDER BY created_at DESC');
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ message: 'Database error' });
    }
  } else if (req.method === 'POST') {
    const { match_name, team1, team2, odd1, odd2 } = req.body;

    try {
      const [result] = await pool.query(
        'INSERT INTO matches (match_name, team1, team2, odd1, odd2) VALUES (?, ?, ?, ?, ?)',
        [match_name, team1, team2, parseFloat(odd1), parseFloat(odd2)]
      );
      res.status(201).json({ id: result.insertId, message: 'Match created successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Database error' });
    }
  } else if (req.method === 'PUT') {
    const { id } = req.query;
    const { match_name, team1, team2, odd1, odd2 } = req.body;

    try {
      await pool.query(
        'UPDATE matches SET match_name = ?, team1 = ?, team2 = ?, odd1 = ?, odd2 = ? WHERE id = ?',
        [match_name, team1, team2, parseFloat(odd1), parseFloat(odd2), id]
      );
      res.status(200).json({ message: 'Match updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Database error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}