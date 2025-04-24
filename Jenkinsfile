pipeline {
    agent any

    environment {
        TARGET_SERVER = "ubuntu@43.138.144.68"
        DEPLOY_DIR = "/home/ubuntu/mbti"
        SERVER_PASSWORD = credentials('mbti_server_password')
    }

    stages {
        stage('检查环境') {
            steps {
                echo '开始部署流程...'
                echo "部署目标服务器: ${TARGET_SERVER}"
                echo "部署目录: ${DEPLOY_DIR}"
                sh 'echo 当前工作目录:'
                sh 'pwd'
                sh 'echo 清理工作目录...'
                sh 'rm -rf *'
            }
        }

        stage('克隆代码') {
            steps {
                sh 'echo 克隆Git仓库...'
                sh 'git clone --depth=1 https://github.com/xiangtian888/MBTI-1.0.git .'
                sh 'echo 当前目录内容:'
                sh 'ls -la'
            }
        }
        
        stage('设置Node环境') {
            steps {
                sh 'echo 检查Node.js和npm版本...'
                sh 'node -v'
                sh 'npm -v'
                sh 'echo 配置npm...'
                sh 'npm config set registry https://registry.npmjs.org/'
                sh 'npm config set fetch-timeout 300000'
            }
        }
        
        stage('安装依赖') {
            steps {
                sh 'echo 安装项目核心依赖...'
                sh 'npm ci --production --no-audit --no-fund'
                sh 'echo 安装服务器依赖...'
                sh 'cd server && npm ci --production --no-audit --no-fund && cd ..'
            }
        }
        
        stage('打包文件') {
            steps {
                sh '''
                echo 打包精简后的文件...
                tar czf deploy.tar.gz \
                  --exclude="node_modules/*/node_modules" \
                  --exclude="node_modules/*.md" \
                  --exclude="node_modules/*.txt" \
                  --exclude="node_modules/.bin" \
                  server package*.json ecosystem.config.js deploy.sh node_modules .next
                echo 检查部署包:
                ls -lh deploy.tar.gz
                '''
            }
        }
        
        stage('上传和部署') {
            steps {
                sh 'echo 上传部署包...'
                sh 'sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no deploy.tar.gz ${TARGET_SERVER}:${DEPLOY_DIR}/'
                sh 'echo 解压和安装...'
                sh '''
                sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${TARGET_SERVER} "
                    cd ${DEPLOY_DIR} && \
                    tar xzf deploy.tar.gz && \
                    rm deploy.tar.gz && \
                    chmod +x deploy.sh && \
                    ./deploy.sh
                "
                '''
            }
        }
        
        stage('验证部署') {
            steps {
                sh 'echo 验证部署...'
                sh '''
                sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${TARGET_SERVER} "
                    cd ${DEPLOY_DIR} && \
                    pm2 status && \
                    curl -s http://localhost:3000/health || echo 'Health check failed but continuing'
                "
                '''
            }
        }
    }
    
    post {
        success {
            echo '部署成功!'
        }
        failure {
            echo '部署失败!'
        }
        always {
            sh 'echo 清理工作空间...'
            sh 'rm -rf node_modules .next server/node_modules'
        }
    }
}