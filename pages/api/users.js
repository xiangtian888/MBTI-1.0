import dbConnect from '../../utils/dbConnect';
import logger from '../../utils/logger';
import User from '../../models/User';

export default async function handler(req, res) {
  const { method } = req;

  try {
    await dbConnect();
    
    switch (method) {
      case 'GET':
        try {
          const users = await User.find({});
          logger.info('成功获取用户列表');
          res.status(200).json({ success: true, data: users });
        } catch (error) {
          logger.error('获取用户列表失败:', error);
          res.status(400).json({ success: false, error: error.message });
        }
        break;
        
      case 'POST':
        try {
          const user = await User.create(req.body);
          logger.info('成功创建新用户');
          res.status(201).json({ success: true, data: user });
        } catch (error) {
          logger.error('创建用户失败:', error);
          res.status(400).json({ success: false, error: error.message });
        }
        break;
        
      default:
        res.status(400).json({ success: false, error: '不支持的请求方法' });
        break;
    }
  } catch (error) {
    logger.error('数据库连接错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
} 