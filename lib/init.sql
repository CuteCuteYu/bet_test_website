-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建比赛表
CREATE TABLE IF NOT EXISTS matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_name VARCHAR(100) NOT NULL,
    team1 VARCHAR(50) NOT NULL,
    team2 VARCHAR(50) NOT NULL,
    odd1 DECIMAL(5, 2) NOT NULL,
    odd2 DECIMAL(5, 2) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    winner ENUM('team1', 'team2', 'draw') DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建押注表
CREATE TABLE IF NOT EXISTS bets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    match_id INT NOT NULL,
    team ENUM('team1', 'team2') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    odd DECIMAL(5, 2) NOT NULL,
    status ENUM('pending', 'won', 'lost') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

-- 插入默认管理员用户
INSERT INTO users (username, password, balance, is_admin) VALUES ('admin', 'admin123', 0.00, TRUE) ON DUPLICATE KEY UPDATE username='admin';

-- 插入测试用户
INSERT INTO users (username, password, balance, is_admin) VALUES ('user1', 'user123', 1000.00, FALSE) ON DUPLICATE KEY UPDATE username='user1';