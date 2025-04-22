import dbConnect from '../../utils/dbConnect';

export default async function handler(req, res) {
  try {
    await dbConnect();
    res.status(200).json({ message: '数据库连接成功！' });
  } catch (error) {
    res.status(500).json({ error: '数据库连接失败：' + error.message });
  }
} 