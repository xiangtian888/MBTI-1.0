const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());

// MongoDB连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mbti_db';

// 连接MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB连接成功');
}).catch((err) => {
  console.error('MongoDB连接失败:', err);
});

// 监听MongoDB连接事件
mongoose.connection.on('error', (err) => {
  console.error('MongoDB连接错误:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB连接断开');
});

// 定义测试结果模型
const TestResult = mongoose.model('TestResult', {
  name: String,
  gender: String,
  phone: String,
  birth: String,
  mbtiType: String,
  zodiacSign: String,
  timestamp: Date,
  recommendation: {
    jobs: [String],
    desc: String
  }
});

// API路由
// 保存测试结果
app.post('/api/results', async (req, res) => {
  try {
    console.log('接收到的数据:', req.body);
    const result = new TestResult(req.body);
    await result.save();
    console.log('保存成功:', result);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('保存失败:', error);
    res.status(500).json({ success: false, error: error.message });
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

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 