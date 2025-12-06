@echo off

REM 设置项目根目录为当前目录
SET PROJECT_DIR=%~dp0

REM 切换到项目根目录
cd /d "%PROJECT_DIR%"

echo ===================================
echo 博彩网站数据库初始化脚本
echo ===================================
echo.
echo 正在初始化数据库...
echo.

REM 检查是否安装了Node.js
node --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo 错误: 未检测到Node.js环境，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo 正在使用Node.js执行数据库初始化...
echo.

REM 执行数据库初始化脚本
node lib/init-db.js

IF %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================
    echo 数据库初始化成功！
    echo ===================================
    echo 数据库连接信息：
    echo 地址: localhost:3306
    echo 数据库名: test
    echo 用户名: roottest
    echo 密码: roottest
    echo.
    echo 提示：
    echo 1. 初始化成功后，可以直接运行 npm run dev 启动项目
    echo 2. 如果遇到索引已存在的错误，属于正常现象，表示表结构已存在
    echo ===================================
) ELSE (
    echo.
    echo ===================================
    echo 数据库初始化失败！
    echo ===================================
    echo 错误信息已显示在上方，请检查：
    echo 1. MySQL服务是否已启动
    echo 2. 数据库连接信息是否正确
    echo 3. 用户是否有足够权限
    echo ===================================
)

echo.
pause