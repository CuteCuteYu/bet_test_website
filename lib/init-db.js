const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function initDB() {
  try {
    // 读取并执行初始SQL文件
    const initSql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    const sessionSql = fs.readFileSync(path.join(__dirname, 'session.sql'), 'utf8');
    const connection = await pool.getConnection();
    await connection.query(initSql);
    await connection.query(sessionSql);
    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

if (require.main === module) {
  initDB();
}

module.exports = initDB;