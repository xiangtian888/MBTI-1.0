const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());

// 连接MongoDB
mongoose.connect('mongodb://localhost:27017/mbti_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
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
    const result = new TestResult(req.body);
    await result.save();
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取所有测试结果
app.get('/api/results', async (req, res) => {
  try {
    const results = await TestResult.find().sort({ timestamp: -1 });
    res.json({ success: true, data: results });
  } catch (error) {
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
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 