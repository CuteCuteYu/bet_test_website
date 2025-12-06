# 博彩网站项目文档

## 项目概述

本项目是一个基于Next.js开发的博彩网站，包含前台页面和后台页面，支持用户注册、登录、押注、查看赔率和余额，以及管理员管理比赛、设置赔率、管理用户余额和查看用户押注历史等功能。

## 技术栈

- **前端框架**：Next.js 14
- **后端语言**：Node.js
- **数据库**：MySQL 8.0
- **ORM**：mysql2/promise
- **会话管理**：HTTP Only Cookie
- **容器化**：Docker
- **部署工具**：docker-compose

## 项目结构

```
├── lib/                 # 核心库文件
│   ├── db.js           # 数据库连接池配置
│   ├── init-db.js      # 数据库初始化脚本
│   ├── init.sql        # 数据库表创建脚本
│   ├── session.js      # 会话管理函数
│   └── session.sql     # 会话表创建脚本
├── pages/              # 页面文件
│   ├── api/            # API路由
│   │   ├── admin/      # 管理员API
│   │   ├── balance.js  # 余额查询API
│   │   ├── bet.js      # 押注API
│   │   ├── login.js    # 登录API
│   │   ├── matches.js  # 比赛查询API
│   │   ├── register.js # 注册API
│   │   └── user-info.js # 用户信息API
│   ├── admin.js        # 管理员页面
│   ├── index.js        # 首页
│   ├── login.js        # 登录页面
│   └── register.js     # 注册页面
├── docker-compose.yml  # Docker Compose配置
├── init-db.bat         # 数据库初始化批处理脚本
├── next.config.js      # Next.js配置
├── package-lock.json   # 依赖锁定文件
└── package.json        # 项目依赖配置
```

## 功能说明

### 前台功能

1. **用户注册**：用户可以注册新账号
2. **用户登录**：用户可以登录系统
3. **查看比赛**：显示即将开始的比赛和已完成的比赛
4. **押注功能**：用户可以选择队伍进行押注
5. **查看余额**：显示用户当前余额
6. **查看押注历史**：用户可以查看自己的押注记录
7. **退出登录**：用户可以安全退出系统

### 后台功能

1. **管理比赛**：
   - 添加新比赛
   - 编辑现有比赛
   - 删除比赛
   - 结算比赛结果
2. **管理用户**：
   - 查看所有用户
   - 修改用户余额
   - 查看用户押注历史
3. **查看统计数据**：
   - 查看总押注金额
   - 查看各比赛押注情况

## 数据库设计

### 1. 用户表 (users)

| 字段名      | 数据类型          | 约束条件                  | 描述               |
|------------|-----------------|-------------------------|--------------------|
| id         | INT             | PRIMARY KEY, AUTO_INCREMENT | 用户ID             |
| username   | VARCHAR(50)     | NOT NULL, UNIQUE        | 用户名             |
| password   | VARCHAR(255)    | NOT NULL                | 密码（加密存储）   |
| balance    | DECIMAL(10, 2)  | DEFAULT 0.00            | 余额               |
| is_admin   | BOOLEAN         | DEFAULT FALSE           | 是否为管理员       |
| created_at | TIMESTAMP       | DEFAULT CURRENT_TIMESTAMP | 创建时间           |

### 2. 比赛表 (matches)

| 字段名      | 数据类型          | 约束条件                  | 描述               |
|------------|-----------------|-------------------------|--------------------|
| id         | INT             | PRIMARY KEY, AUTO_INCREMENT | 比赛ID             |
| match_name | VARCHAR(100)    | NOT NULL                | 比赛名称           |
| team1      | VARCHAR(50)     | NOT NULL                | 队伍1名称          |
| team2      | VARCHAR(50)     | NOT NULL                | 队伍2名称          |
| odd1       | DECIMAL(5, 2)   | NOT NULL                | 队伍1赔率          |
| odd2       | DECIMAL(5, 2)   | NOT NULL                | 队伍2赔率          |
| status     | ENUM            | DEFAULT 'pending'       | 状态（pending/completed/cancelled） |
| winner     | ENUM            | DEFAULT NULL            | 获胜方（team1/team2/draw） |
| created_at | TIMESTAMP       | DEFAULT CURRENT_TIMESTAMP | 创建时间           |

### 3. 押注表 (bets)

| 字段名      | 数据类型          | 约束条件                  | 描述               |
|------------|-----------------|-------------------------|--------------------|
| id         | INT             | PRIMARY KEY, AUTO_INCREMENT | 押注ID             |
| user_id    | INT             | NOT NULL, FOREIGN KEY   | 用户ID             |
| match_id   | INT             | NOT NULL, FOREIGN KEY   | 比赛ID             |
| team       | ENUM            | NOT NULL                | 押注队伍（team1/team2） |
| amount     | DECIMAL(10, 2)  | NOT NULL                | 押注金额           |
| odd        | DECIMAL(5, 2)   | NOT NULL                | 押注时赔率         |
| status     | ENUM            | DEFAULT 'pending'       | 状态（pending/won/lost） |
| created_at | TIMESTAMP       | DEFAULT CURRENT_TIMESTAMP | 创建时间           |

### 4. 会话表 (sessions)

| 字段名      | 数据类型          | 约束条件                  | 描述               |
|------------|-----------------|-------------------------|--------------------|
| id         | VARCHAR(255)    | PRIMARY KEY             | 会话ID             |
| user_id    | INT             | NOT NULL, FOREIGN KEY   | 用户ID             |
| created_at | TIMESTAMP       | DEFAULT CURRENT_TIMESTAMP | 创建时间           |
| expires_at | TIMESTAMP       | NOT NULL                | 过期时间           |

## 部署说明

### 1. 本地部署

#### 环境要求

- Node.js 18+
- MySQL 8.0

#### 部署步骤

1. **克隆项目**
   ```bash
   git clone <项目地址>
   cd <项目目录>
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **初始化数据库**
   ```bash
   # 确保MySQL服务已启动
   node lib/init-db.js
   ```
   或使用批处理脚本（Windows）：
   ```bash
   init-db.bat
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问网站**
   - 前台：http://localhost:3000
   - 后台：http://localhost:3000/admin

### 2. Docker部署

#### 环境要求

- Docker
- docker-compose

#### 部署步骤

1. **克隆项目**
   ```bash
   git clone <项目地址>
   cd <项目目录>
   ```

2. **启动服务**
   ```bash
   docker-compose up -d
   ```

3. **访问网站**
   - 前台：http://localhost:3000
   - 后台：http://localhost:3000/admin

#### Docker Compose配置说明

- **MySQL服务**：
  - 端口映射：3306:3306
  - 环境变量：设置了root密码、数据库名、用户名和密码
  - 卷挂载：持久化MySQL数据，自动执行初始化脚本

- **Node.js应用服务**：
  - 端口映射：3000:3000
  - 环境变量：设置了数据库连接信息
  - 卷挂载：挂载项目文件到容器
  - 依赖关系：等待MySQL服务健康后再启动

## 使用说明

### 1. 用户注册和登录

1. **注册**：访问 http://localhost:3000/register，填写用户名和密码进行注册
2. **登录**：访问 http://localhost:3000/login，使用注册的用户名和密码登录
3. **管理员登录**：使用默认管理员账号登录
   - 用户名：admin
   - 密码：admin123

### 2. 前台功能

1. **查看比赛**：登录后在首页查看即将开始的比赛
2. **押注**：选择比赛和队伍，输入押注金额，点击押注按钮
3. **查看余额**：页面右上角显示当前余额
4. **查看已结算比赛**：在"已完成"标签页查看已结算的比赛

### 3. 后台功能

1. **管理比赛**：
   - 添加比赛：点击"添加比赛"按钮，填写比赛信息
   - 编辑比赛：点击比赛列表中的"编辑"按钮
   - 删除比赛：点击比赛列表中的"删除"按钮
   - 结算比赛：点击比赛列表中的"结算"按钮，选择获胜方

2. **管理用户**：
   - 查看用户列表：在"用户管理"标签页查看所有用户
   - 修改用户余额：点击用户列表中的"修改余额"按钮
   - 查看用户押注历史：点击用户列表中的"押注历史"按钮

## 安全说明

1. **密码安全**：用户密码使用bcrypt算法加密存储
2. **会话管理**：使用HTTP Only Cookie存储会话ID，防止XSS攻击
3. **权限控制**：管理员功能需要管理员权限才能访问
4. **数据库操作**：使用参数化查询，防止SQL注入攻击
5. **交易管理**：押注和结算操作使用数据库事务，确保数据一致性

## 注意事项

1. **数据库连接**：确保MySQL服务已启动，并且连接信息正确
2. **端口占用**：确保3000和3306端口未被其他服务占用
3. **环境变量**：在生产环境中，应使用环境变量设置敏感信息
4. **备份数据**：定期备份MySQL数据库，防止数据丢失
5. **性能优化**：对于大规模部署，建议优化数据库索引和连接池配置

## 开发说明

### 1. API路由

#### 前台API

- **GET /api/matches**：获取比赛列表
- **POST /api/bet**：提交押注
- **GET /api/balance**：获取用户余额
- **POST /api/login**：用户登录
- **POST /api/register**：用户注册
- **GET /api/user-info**：获取用户信息

#### 管理员API

- **GET /api/admin/matches**：获取所有比赛
- **POST /api/admin/matches**：添加比赛
- **PUT /api/admin/matches/[id]**：编辑比赛
- **DELETE /api/admin/matches/[id]**：删除比赛
- **POST /api/admin/matches/[id]/result**：结算比赛结果
- **GET /api/admin/users**：获取所有用户
- **PUT /api/admin/users/[id]/balance**：修改用户余额
- **GET /api/admin/users/[id]/bets**：获取用户押注历史

### 2. 会话管理

- **创建会话**：登录成功后，创建会话并设置HTTP Only Cookie
- **验证会话**：API请求时，通过Cookie中的会话ID验证用户身份
- **销毁会话**：退出登录时，销毁会话并清除Cookie

## 故障排除

### 1. 数据库连接错误

- 检查MySQL服务是否已启动
- 检查数据库连接信息是否正确
- 检查防火墙设置，确保3306端口可访问

### 2. 权限错误

- 确保当前用户有足够的权限访问MySQL数据库
- 确保文件和目录有正确的权限

### 3. 应用启动错误

- 检查依赖是否已正确安装
- 检查端口是否被占用
- 查看应用日志，定位错误原因

## 更新日志

### v1.0.0

- 初始版本
- 实现了用户注册、登录功能
- 实现了押注功能
- 实现了管理员管理比赛和用户功能
- 实现了比赛结果结算功能
- 支持Docker部署

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request，共同改进项目。

## 联系方式

如有问题，请联系项目管理员。