@echo off
chcp 65001 >nul
title 陶瓷文物数字展厅 - 开发模式
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [错误] 未安装 Node.js：https://nodejs.org
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo 首次运行，正在安装依赖…
  call npm install
  if errorlevel 1 ( pause & exit /b 1 )
)

call npm run dev
pause
