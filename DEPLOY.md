# MBTI应用部署指南

## 系统要求
- Ubuntu 20.04 或更高版本
- Node.js 16.x 或更高版本
- MongoDB 4.4 或更高版本
- Nginx
- PM2

## 安装依赖

```bash
# 更新系统
sudo apt update
sudo apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# 安装PM2
sudo npm install -g pm2

# 安装Nginx
sudo apt install -y nginx

# 安装MongoDB（如果需要在本地运行数据库）
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

## 部署步骤

1. 克隆代码：
```bash
git clone <你的仓库地址>
cd MBTI-1.0
```

2. 安装依赖：
```bash
npm install
```

3. 构建生产版本：
```bash
npm run build
```

4. 配置环境变量：
```bash
# 创建环境变量文件
cp .env.example .env.local
# 编辑环境变量
nano .env.local
```

5. 配置PM2：
```bash
# 启动应用
pm2 start ecosystem.config.js
# 设置开机自启
pm2 startup
pm2 save
```

6. 配置Nginx：
```bash
# 复制Nginx配置
sudo cp nginx.conf /etc/nginx/sites-available/mbti-app
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/mbti-app /etc/nginx/sites-enabled/
# 测试配置
sudo nginx -t
# 重启Nginx
sudo systemctl restart nginx
```

## 日志位置
- 应用日志：`logs/combined.log` 和 `logs/error.log`
- PM2日志：`logs/pm2/out.log` 和 `logs/pm2/error.log`
- Nginx日志：`/var/log/nginx/access.log` 和 `/var/log/nginx/error.log`

## 常用维护命令

```bash
# 重启应用
pm2 restart mbti-app

# 查看日志
pm2 logs mbti-app

# 查看应用状态
pm2 status

# 更新代码并重新部署
git pull
npm install
npm run build
pm2 restart mbti-app
```

## 安全建议

1. 设置防火墙：
```bash
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

2. 配置SSL证书（推荐使用Let's Encrypt）：
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

3. 定期更新系统：
```bash
sudo apt update
sudo apt upgrade
```

## 监控

1. 使用PM2监控：
```bash
pm2 monit
```

2. 设置日志轮转：
```bash
sudo nano /etc/logrotate.d/mbti-app
```

添加以下内容：
```
/path/to/your/app/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

## 故障排除

1. 如果应用无法启动：
- 检查日志：`pm2 logs mbti-app`
- 检查MongoDB连接：`mongo`
- 检查端口占用：`netstat -tulpn | grep 3000`

2. 如果无法访问网站：
- 检查Nginx状态：`sudo systemctl status nginx`
- 检查Nginx错误日志：`sudo tail -f /var/log/nginx/error.log`
- 检查防火墙规则：`sudo ufw status` 