const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// 中间件配置
app.use(cors({
  origin: '*', // 允许所有来源访问
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB Atlas连接配置
const MONGODB_URI = 'mongodb+srv://ylwhshuju:xiangtian999@cluster0.fsaypjw.mongodb.net/mbti_db?retryWrites=true&w=majority&appName=Cluster0';

// 连接MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}).then(() => {
  console.log('MongoDB Atlas连接成功');
}).catch((err) => {
  console.error('MongoDB Atlas连接失败:', err);
});

// 监听MongoDB连接事件
mongoose.connection.on('error', (err) => {
  console.error('MongoDB连接错误:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB连接断开');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB重新连接成功');
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
  res.json({ message: '服务器运行正常' });
});

// API路由
// 保存测试结果
app.post('/api/results', async (req, res) => {
  try {
    console.log('接收到的数据:', req.body);
    
    // 验证必填字段
    const requiredFields = ['name', 'gender', 'phone', 'birth', 'mbtiType', 'zodiacSign'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
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
    const results = await TestResult.find().sort({ timestamp: -1 });
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('获取数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 按条件筛选测试结果
app.post('/api/results/filter', async (req, res) => {
  try {
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
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('筛选数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    timestamp: new Date(),
    mongodb: dbStatus,
    uptime: process.uptime()
  });
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

// 处理未找到的路由
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '未找到请求的资源'
  });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
}); 