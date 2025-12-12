@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title CardShop 一键启动

REM 切换到脚本所在目录
cd /d "%~dp0"

echo [CardShop] 环境检查...
where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] 未检测到 Node.js，请先安装：https://nodejs.org/
  start "" "https://nodejs.org/"
  pause
  exit /b 1
)

REM 读取端口（默认3000）
set PORT=3000
if exist ".env" (
  for /f "tokens=1,2 delims==" %%A in (.env) do (
    if /i "%%A"=="PORT" (
      set PORT=%%B
    )
  )
)

echo [CardShop] 端口: %PORT%

REM 首次安装依赖
if not exist "node_modules" (
  echo [CardShop] 正在安装依赖...
  call npm.cmd install
  if errorlevel 1 (
    echo [ERROR] 依赖安装失败，请检查网络或npm配置
    pause
    exit /b 1
  )
)

echo [CardShop] 启动服务...
REM 在新窗口启动服务，避免阻塞当前窗口
start "CardShop Server" cmd /c "npm.cmd run start"

REM 打开浏览器首页
start "" "http://localhost:%PORT%/public/index.html"

echo [CardShop] 已启动。如未自动打开，请手动访问 http://localhost:%PORT%/
pause
