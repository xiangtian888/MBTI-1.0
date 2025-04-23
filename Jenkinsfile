pipeline {
    agent any

    environment {
        REMOTE_USER = 'ubuntu'
        REMOTE_HOST = '43.138.144.68'
        DEPLOY_PATH = '/home/ubuntu/mbti'
        NODE_VERSION = '16.20.2'
        REMOTE_PASS = 'e2/ZUCBLt]p3k(}q'
        GIT_REPO = 'https://github.com/xiangtian888/MBTI-1.0.git'
    }

    stages {
        stage('检查环境') {
            steps {
                echo "开始部署流程..."
                echo "部署目标服务器: ${REMOTE_USER}@${REMOTE_HOST}"
                echo "部署目录: ${DEPLOY_PATH}"
                sh '''
                    echo "当前工作目录:"
                    pwd
                    echo "清理工作目录..."
                    rm -rf *
                '''
            }
        }

        stage('克隆代码') {
            steps {
                sh '''
                    echo "克隆Git仓库..."
                    git clone ${GIT_REPO} .
                    
                    echo "当前目录内容:"
                    ls -la
                '''
            }
        }
        
        stage('设置Node环境') {
            steps {
                sh '''
                    echo "检查Node.js和npm版本..."
                    node -v
                    npm -v
                    
                    # 使用nvm安装指定版本的Node.js（如果可用）
                    if command -v nvm &>/dev/null; then
                        echo "使用nvm安装Node.js ${NODE_VERSION}..."
                        nvm install ${NODE_VERSION}
                        nvm use ${NODE_VERSION}
                    elif command -v n &>/dev/null; then
                        echo "使用n安装Node.js ${NODE_VERSION}..."
                        n ${NODE_VERSION}
                    else
                        echo "未发现nvm或n，使用系统默认Node.js版本"
                    fi
                    
                    # 设置npm缓存和超时
                    echo "配置npm..."
                    npm config set registry https://registry.npmjs.org/
                    npm config set fetch-timeout 300000
                '''
            }
        }
        
        stage('安装依赖') {
            steps {
                sh '''
                    echo "安装项目依赖..."
                    npm install --no-audit --no-fund
                    
                    echo "查看安装结果:"
                    npm list --depth=0
                '''
            }
        }
        
        stage('构建前端') {
            steps {
                sh '''
                    echo "开始构建前端项目..."
                    export NODE_OPTIONS="--max-old-space-size=4096"
                    npm run build || {
                        echo "前端构建失败，查看错误日志:"
                        cat .next/build-error.log 2>/dev/null || echo "没有找到构建错误日志"
                        echo "继续部署，但前端可能无法正常工作"
                    }
                    
                    echo "检查构建结果:"
                    ls -la .next 2>/dev/null || echo ".next目录不存在，构建可能失败"
                '''
            }
        }

        stage('准备服务器环境') {
            steps {
                sh '''
                    echo "安装Node.js和PM2..."
                    sshpass -p "${REMOTE_PASS}" ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "
                        # 检查Node.js是否已安装
                        if ! command -v node &> /dev/null; then
                            echo '安装Node.js...'
                            curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
                            sudo apt-get install -y nodejs
                        fi
                        
                        # 检查npm是否已安装
                        if ! command -v npm &> /dev/null; then
                            echo '安装npm...'
                            sudo apt-get install -y npm
                        fi
                        
                        # 检查PM2是否已安装
                        if ! command -v pm2 &> /dev/null; then
                            echo '安装PM2...'
                            sudo npm install -g pm2
                        fi
                        
                        # 显示版本信息
                        echo '环境信息:'
                        node -v
                        npm -v
                        pm2 -v
                    "
                    
                    echo "创建部署目录..."
                    sshpass -p "${REMOTE_PASS}" ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "
                        mkdir -p ${DEPLOY_PATH}
                        
                        # 检查并停止已运行的服务
                        echo '检查并停止已运行的服务...'
                        pm2 stop mbti 2>/dev/null || true
                        pm2 delete mbti 2>/dev/null || true
                        
                        # 检查端口占用
                        echo '检查端口占用...'
                        sudo lsof -i :3000 || true
                        sudo kill -9 \$(sudo lsof -t -i:3000) 2>/dev/null || true
                    "
                '''
            }
        }

        stage('打包文件') {
            steps {
                sh '''
                    echo "检查并打包文件..."
                    FILES_TO_PACK=""
                    
                    # 检查每个文件/目录是否存在
                    for item in .next node_modules package.json package-lock.json public components pages styles app lib config server utils; do
                        if [ -e "$item" ]; then
                            FILES_TO_PACK="$FILES_TO_PACK $item"
                            echo "找到文件/目录: $item"
                        else
                            echo "警告: $item 不存在，将跳过"
                        fi
                    done
                    
                    if [ -z "$FILES_TO_PACK" ]; then
                        echo "错误: 没有找到任何可打包的文件!"
                        exit 1
                    fi
                    
                    echo "开始打包文件: $FILES_TO_PACK"
                    tar czf deploy.tar.gz $FILES_TO_PACK
                    
                    echo "检查部署包:"
                    ls -lh deploy.tar.gz
                '''
            }
        }

        stage('上传和部署') {
            steps {
                sh '''
                    echo "上传部署包..."
                    sshpass -p "${REMOTE_PASS}" scp -o StrictHostKeyChecking=no deploy.tar.gz ${REMOTE_USER}@${REMOTE_HOST}:${DEPLOY_PATH}/
                    
                    echo "解压和安装..."
                    sshpass -p "${REMOTE_PASS}" ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "
                        cd ${DEPLOY_PATH} && \
                        tar xzf deploy.tar.gz && \
                        rm deploy.tar.gz && \
                        export PATH=\$PATH:/usr/local/bin && \
                        npm install && \
                        cd server && npm install && cd .. && \
                        
                        # 启动服务器
                        echo '启动服务器...' && \
                        PORT=3000 pm2 start server/index.js --name mbti && \
                        
                        # 等待服务器启动
                        echo '等待服务器启动...' && \
                        sleep 5 && \
                        
                        # 检查服务器状态
                        echo '检查服务器状态...' && \
                        curl -s http://localhost:3000/health || echo '服务器未响应' && \
                        
                        # 显示PM2状态
                        echo '显示PM2状态:' && \
                        pm2 status && \
                        
                        # 显示日志
                        echo '显示服务器日志:' && \
                        pm2 logs mbti --lines 20
                    "
                    
                    echo "清理本地部署包..."
                    rm deploy.tar.gz
                '''
            }
        }

        stage('验证部署') {
            steps {
                sh '''
                    echo "验证服务器状态..."
                    sshpass -p "${REMOTE_PASS}" ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "
                        echo '检查服务器响应...'
                        curl -s http://localhost:3000/health
                        
                        echo '\\n检查MongoDB连接...'
                        curl -s http://localhost:3000/
                        
                        echo '\\n检查端口监听状态...'
                        sudo netstat -tlpn | grep :3000
                        
                        echo '\\n检查防火墙规则...'
                        sudo ufw status | grep 3000 || echo '端口 3000 未在防火墙中开放'
                        
                        echo '\\n检查服务日志...'
                        pm2 logs mbti --lines 10
                    "
                '''
            }
        }
    }
    
    post {
        success {
            echo '部署成功！'
            echo '请检查服务是否正常运行'
        }
        failure {
            echo '部署失败！'
            echo '请检查以上日志以定位问题'
        }
    }
}