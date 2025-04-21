pipeline {
    agent {
        docker {
            image 'node:18-alpine'
            args '-p 3000:3000'
        }
    }

    environment {
        NODE_VERSION = '18'
        NPM_CONFIG_CACHE = '/tmp/npm-cache'
        TENCENT_CLOUD_IP = '43.138.144.68'
        DEPLOY_USER = 'ubuntu'
    }

    stages {
        stage('环境检查') {
            steps {
                sh '''
                    echo "检查 Node.js 版本..."
                    node -v
                    echo "检查 npm 版本..."
                    npm -v
                '''
            }
        }

        stage('检出代码') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/xiangtian888/MBTI-1.0.git']]])
            }
        }
        
        stage('清理和安装依赖') {
            steps {
                sh '''
                    echo "清理 npm 缓存..."
                    npm cache clean --force
                    
                    echo "安装依赖..."
                    npm install
                    
                    echo "检查依赖版本..."
                    npm list
                '''
            }
        }

        stage('代码质量检查') {
            steps {
                sh '''
                    echo "安装代码检查工具..."
                    npm install --save-dev eslint prettier
                    
                    echo "运行代码格式检查..."
                    if [ -f ".eslintrc.js" ]; then
                        npx eslint . || true
                    else
                        echo "未找到 ESLint 配置文件，跳过 ESLint 检查"
                    fi
                '''
            }
        }
        
        stage('构建') {
            steps {
                sh '''
                    echo "开始构建..."
                    npm run build
                '''
            }
        }
        
        stage('部署到腾讯云') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'tencent-cloud-credentials', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                    sh '''
                        echo "安装 sshpass..."
                        apt-get update && apt-get install -y sshpass
                        
                        echo "创建部署目录..."
                        sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${TENCENT_CLOUD_IP} "mkdir -p /home/ubuntu/mbti"
                        
                        echo "打包应用文件..."
                        tar -czf dist.tar.gz .next node_modules package.json package-lock.json
                        
                        echo "部署到腾讯云服务器..."
                        sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no dist.tar.gz ${DEPLOY_USER}@${TENCENT_CLOUD_IP}:/home/ubuntu/mbti
                        
                        echo "在远程服务器上部署应用..."
                        sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${TENCENT_CLOUD_IP} "cd /home/ubuntu/mbti && \
                            tar -xzf dist.tar.gz && \
                            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash && \
                            export NVM_DIR=\$HOME/.nvm && \
                            [ -s \$NVM_DIR/nvm.sh ] && \. \$NVM_DIR/nvm.sh && \
                            nvm install 18 && \
                            npm install -g pm2 && \
                            npm install --production && \
                            pm2 restart mbti || pm2 start npm --name 'mbti' -- start"
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo '部署成功! 应用可以通过 http://43.138.144.68:3000 访问'
        }
        failure {
            echo '部署失败，请检查日志'
        }
    }
} 