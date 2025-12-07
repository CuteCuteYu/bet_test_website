const pool = require('./db');

async function updateDB() {
  try {
    const connection = await pool.getConnection();
    
    // 更新matches表，添加locked状态
    await connection.query(
      'ALTER TABLE matches MODIFY COLUMN status ENUM(\'pending\', \'locked\', \'completed\', \'cancelled\') DEFAULT \'pending\''
    );
    
    connection.release();
    console.log('Database updated successfully');
  } catch (error) {
    console.error('Error updating database:', error);
  }
}

if (require.main === module) {
  updateDB();
}

module.exports = updateDB;