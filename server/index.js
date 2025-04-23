const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

// 启用更详细的日志
const logRequests = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length) {
    console.log('Body:', req.body);
  }
  next();
};

app.use(logRequests);

// 中间件配置
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 处理预检请求
app.options('*', cors());

app.use(express.json());

// 静态文件服务
app.use(express.static(path.join(__dirname, '../.next')));
app.use(express.static(path.join(__dirname, '../public')));

// MongoDB Atlas连接配置
const MONGODB_URI = 'mongodb+srv://ylwhshuju:xiangtian999@cluster0.fsaypjw.mongodb.net/mbti_db?retryWrites=true&w=majority&appName=Cluster0';

// MongoDB连接重试逻辑
const connectWithRetry = async (retryCount = 0) => {
  const maxRetries = 5;
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 60000, // 增加到60秒
    socketTimeoutMS: 75000,         // 增加到75秒
    retryWrites: true,
    w: 'majority',
    connectTimeoutMS: 60000,        // 增加到60秒
    family: 4                        // 强制使用IPv4
  };

  try {
    console.log(`尝试连接MongoDB Atlas... (第${retryCount + 1}次尝试)`);
    console.log(`连接URI: ${MONGODB_URI.replace(/:[^:]*@/, ':****@')}`); // 隐藏密码
    await mongoose.connect(MONGODB_URI, options);
    console.log('MongoDB Atlas连接成功');
  } catch (err) {
    console.error('MongoDB Atlas连接失败:', err.message);
    console.error('详细错误:', JSON.stringify(err, null, 2));
    
    if (retryCount < maxRetries) {
      const nextRetryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.log(`${nextRetryDelay/1000}秒后进行第${retryCount + 2}次重试...`);
      setTimeout(() => connectWithRetry(retryCount + 1), nextRetryDelay);
    } else {
      console.error(`已达到最大重试次数(${maxRetries})，请检查网络设置和MongoDB Atlas配置`);
    }
  }
};

// 初始连接
connectWithRetry();

// 监听MongoDB连接事件
mongoose.connection.on('error', (err) => {
  console.error('MongoDB连接错误:', err.message);
  if (mongoose.connection.readyState === 0) {
    connectWithRetry();
  }
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB连接断开，尝试重新连接...');
  if (mongoose.connection.readyState === 0) {
    connectWithRetry();
  }
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB连接已建立');
});

// 定义测试结果模型
const TestResult = mongoose.model('TestResult', {
  name: String,
  gender: String,
  phone: String,
  birth: String,
  mbtiType: String,
  zodiacSign: String,
  timestamp: { type: Date, default: Date.now },
  recommendation: {
    jobs: [String],
    desc: String
  }
});

// 根路由
app.get('/', (req, res) => {
  res.json({ 
    message: '服务器运行正常',
    time: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API路由
// 保存测试结果
app.post('/api/results', async (req, res) => {
  try {
    console.log('接收到保存请求:', new Date().toISOString());
    console.log('接收到的数据:', req.body);
    
    // 验证必填字段
    const requiredFields = ['name', 'gender', 'phone', 'birth', 'mbtiType', 'zodiacSign'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('缺少必填字段:', missingFields);
      return res.status(400).json({
        success: false,
        error: `缺少必填字段: ${missingFields.join(', ')}`
      });
    }

    const result = new TestResult(req.body);
    await result.save();
    console.log('保存成功:', result);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('保存失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: '数据保存失败，请检查数据格式是否正确'
    });
  }
});

// 获取所有测试结果
app.get('/api/results', async (req, res) => {
  try {
    console.log('接收到获取请求:', new Date().toISOString());
    const results = await TestResult.find().sort({ timestamp: -1 });
    console.log(`找到 ${results.length} 条结果`);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('获取数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 按条件筛选测试结果
app.post('/api/results/filter', async (req, res) => {
  try {
    console.log('接收到筛选请求:', new Date().toISOString());
    console.log('筛选条件:', req.body);
    
    const { startDate, endDate, mbtiType, zodiacSign } = req.body;
    let query = {};
    
    if (startDate) {
      query.timestamp = { $gte: new Date(startDate) };
    }
    if (endDate) {
      query.timestamp = { ...query.timestamp, $lte: new Date(endDate) };
    }
    if (mbtiType) {
      query.mbtiType = mbtiType;
    }
    if (zodiacSign) {
      query.zodiacSign = zodiacSign;
    }
    
    const results = await TestResult.find(query).sort({ timestamp: -1 });
    console.log(`筛选到 ${results.length} 条结果`);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('筛选数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const healthInfo = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: dbStatus,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    node: process.version
  };
  console.log('健康检查:', healthInfo);
  res.json(healthInfo);
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 处理所有其他路由 - 返回前端页面
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../.next/server/pages/index.html'));
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器启动时间: ${new Date().toISOString()}`);
  console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
  console.log('环境变量:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT
  });
}); 