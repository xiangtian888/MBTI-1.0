module.exports = {
  apps: [{
    name: 'mbti',
    script: 'server/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      MONGODB_URI: 'mongodb+srv://ylwhshuju:xiangtian999@cluster0.fsaypjw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    restart_delay: 3000,
    wait_ready: true,
    kill_timeout: 10000
  }]
}; 