@echo off
chcp 65001 >nul
title 陶瓷文物数字展厅
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [错误] 未检测到 Node.js，请先安装：https://nodejs.org
  echo 安装后重新运行本脚本。
  pause
  exit /b 1
)

if not exist "dist\index.html" (
  echo [提示] 未找到 dist，正在执行构建…
  call npm install
  if errorlevel 1 ( pause & exit /b 1 )
  call npm run build
  if errorlevel 1 ( pause & exit /b 1 )
)

echo.
echo ========================================
echo   展厅已启动：请在浏览器打开
echo   http://localhost:4173
echo   关闭本窗口即停止服务
echo ========================================
echo.

npx --yes serve dist -s -l 4173

pause
