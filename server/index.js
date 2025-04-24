const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB连接
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://ylwhshuju:xiangtian999@cluster0.fsaypjw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// 移除已弃用的选项
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB Atlas连接成功');
  })
  .catch(err => {
    console.error('MongoDB连接错误:', err);
  });

// 监听连接事件
mongoose.connection.on('connected', () => {
  console.log('MongoDB连接已建立');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB连接错误:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB连接已断开');
});

// API路由
app.get('/health', (req, res) => {
  console.log('2025-04-23T10:39:11.994Z - GET /health');
  console.log('Headers:', req.headers);
  
  const healthInfo = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    node: process.version
  };
  
  console.log('健康检查:', healthInfo);
  res.json(healthInfo);
});

// 如果是生产环境，提供静态文件
if (process.env.NODE_ENV === 'production') {
  // 提供Next.js静态文件
  app.use(express.static(path.join(__dirname, '../.next')));
  
  // 处理所有其他请求并返回首页
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../.next/server/pages/index.html'));
  });
}

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    error: '服务器内部错误', 
    message: err.message 
  });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
  console.log('环境变量:', { NODE_ENV: process.env.NODE_ENV, PORT: process.env.PORT });
});

// 优雅退出
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('MongoDB连接已关闭');
    process.exit(0);
  });
}); 