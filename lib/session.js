const crypto = require('crypto');
const pool = require('./db');

// 生成会话ID
const generateSessionId = () => {
  return crypto.randomBytes(32).toString('hex');
};

// 创建会话
const createSession = async (userId, res) => {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天过期

  try {
    await pool.query(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
      [sessionId, userId, expiresAt]
    );

    // 设置cookie
    res.setHeader('Set-Cookie', [
      `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`
    ]);

    return sessionId;
  } catch (error) {
    throw new Error('Failed to create session');
  }
};

// 验证会话
const verifySession = async (req) => {
  const sessionId = req.cookies?.sessionId;

  if (!sessionId) {
    return null;
  }

  try {
    const [rows] = await pool.query(
      'SELECT user_id FROM sessions WHERE id = ? AND expires_at > NOW()',
      [sessionId]
    );

    if (rows.length > 0) {
      return rows[0].user_id;
    }

    return null;
  } catch (error) {
    throw new Error('Failed to verify session');
  }
};

// 销毁会话
const destroySession = async (req, res) => {
  const sessionId = req.cookies?.sessionId;

  if (sessionId) {
    try {
      await pool.query('DELETE FROM sessions WHERE id = ?', [sessionId]);
    } catch (error) {
      throw new Error('Failed to destroy session');
    }
  }

  // 清除cookie
  res.setHeader('Set-Cookie', [
    'sessionId=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'
  ]);
};

// 导出所有函数
module.exports = {
  createSession,
  verifySession,
  destroySession
};