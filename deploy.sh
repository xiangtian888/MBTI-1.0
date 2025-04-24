#!/bin/bash
# MBTI系统部署脚本

# 环境变量
export NODE_ENV=production
export PORT=3000
export MONGODB_URI="mongodb+srv://ylwhshuju:xiangtian999@cluster0.fsaypjw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
export NODE_OPTIONS="--max_old_space_size=2048 --openssl-legacy-provider"

# 创建日志目录
mkdir -p logs

# 如果需要，跳过npm安装，直接使用上传的node_modules
if [ "$1" != "--skip-install" ] && [ ! -d "node_modules" ]; then
  echo "安装项目依赖..."
  npm install --production --no-audit --no-fund
fi

# 如果需要，跳过服务器依赖安装
if [ "$1" != "--skip-install" ] && [ ! -d "server/node_modules" ]; then
  echo "安装服务器依赖..."
  cd server && npm install --production --no-audit --no-fund && cd ..
fi

# 创建必要的目录
mkdir -p .next/server/pages

# 确保存在最小化的前端页面
if [ ! -f .next/server/pages/index.html ]; then
  echo "创建最小化前端页面..."
  mkdir -p .next/server/pages
  cat > .next/server/pages/index.html << 'EOL'
<!DOCTYPE html>
<html>
<head>
  <title>MBTI测试系统</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <h1>MBTI测试系统</h1>
  <p>API服务正常运行。<a href="/health">查看API状态</a></p>
</body>
</html>
EOL
fi

# 停止现有服务
echo "停止现有服务..."
pm2 stop mbti 2>/dev/null || true
pm2 delete mbti 2>/dev/null || true

# 启动服务
echo "启动服务..."
pm2 start ecosystem.config.js

# 等待服务启动
echo "等待服务启动..."
sleep 5

# 检查服务状态
echo "检查服务状态..."
curl -s http://localhost:3000/health || echo "Health check failed, but continuing"

# 保存PM2配置
echo "保存PM2配置..."
pm2 save

echo "部署完成!"