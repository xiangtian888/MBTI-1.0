import mongoose from 'mongoose';
import User from '../../models/User';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://ylwhshuju:xiangtian999@cluster0.fsaypjw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

if (!MONGODB_URI) {
  throw new Error(
    '请在.env.local文件中定义MONGODB_URI环境变量'
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// 最大重试次数
const MAX_RETRIES = 3;
// 重试间隔（毫秒）
const RETRY_DELAY = 1000;

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
          console.log('数据库连接成功');
          return mongoose;
        });
        break;
      } catch (error) {
        retries++;
        console.error(`数据库连接失败，第${retries}次重试:`, error.message);
        if (retries === MAX_RETRIES) {
          throw new Error(`数据库连接失败，已重试${MAX_RETRIES}次`);
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('数据库连接错误:', e);
    throw e;
  }

  return cached.conn;
}

// 添加数据库连接状态监听
mongoose.connection.on('connected', () => {
  console.log('MongoDB连接已建立');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB连接错误:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB连接已断开');
});

process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB连接已关闭');
    process.exit(0);
  } catch (err) {
    console.error('关闭MongoDB连接时出错:', err);
    process.exit(1);
  }
});

export default dbConnect; 