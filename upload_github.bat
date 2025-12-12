@echo off
chcp 65001 >nul
setlocal
title 上传到GitHub
cd /d "%~dp0"

where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] 未检测到 Git，请安装：https://git-scm.com/download/win
  start "" "https://git-scm.com/download/win"
  pause
  exit /b 1
)

echo 请选择推送方式：
echo 1) HTTPS + 个人访问令牌（PAT）
echo 2) SSH（需本机已配置SSH Key）
set /p PUSH_MODE=输入1或2并回车: 

if "%PUSH_MODE%"=="1" (
  set /p GIT_USER=请输入GitHub用户名: 
  set /p GIT_REPO=请输入仓库名(例如 ai_hack_cardshop): 
  set /p GIT_PAT=请输入PAT(仅用于本次推送，不会保存): 
  if "%GIT_USER%"=="" goto badinput
  if "%GIT_REPO%"=="" goto badinput
  if "%GIT_PAT%"=="" goto badinput
  set GIT_REMOTE=https://%GIT_USER%:%GIT_PAT%@github.com/%GIT_USER%/%GIT_REPO%.git
) else if "%PUSH_MODE%"=="2" (
  set /p GIT_USER=请输入GitHub用户名: 
  set /p GIT_REPO=请输入仓库名(例如 ai_hack_cardshop): 
  if "%GIT_USER%"=="" goto badinput
  if "%GIT_REPO%"=="" goto badinput
  set GIT_REMOTE=git@github.com:%GIT_USER%/%GIT_REPO%.git
) else (
  goto badinput
)

echo 使用远程：%GIT_REMOTE%

git init
git add -A
git commit -m "chore: add one-click start script and gitignore"
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin "%GIT_REMOTE%"
git push -u origin main

if errorlevel 1 (
  echo [ERROR] 推送失败，请确认远程仓库存在且已配置凭据（PAT或SSH）
  pause
  exit /b 1
)

echo [OK] 已推送到：%GIT_REMOTE%
pause

:badinput
echo [ERROR] 输入不完整或无效
pause
exit /b 1
