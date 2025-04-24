import dbConnect from '../../utils/dbConnect';
import logger from '../../utils/logger';

export default async function handler(req, res) {
  try {
    await dbConnect();
    logger.info('测试API被调用');
    res.status(200).json({ 
      success: true, 
      message: 'API测试成功',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('测试API错误:', error);
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误',
      details: error.message
    });
  }
} 