pipeline {
    agent any

    environment {
        DEPLOY_HOST = '43.138.144.68'
        DEPLOY_USER = 'ubuntu'
        DEPLOY_DIR = '/home/ubuntu/mbti'
        DEPLOY_PASS = 'e2/ZUCBLt]p3k(}q'
        NODE_VERSION = '18'
    }

    stages {
        stage('设置 Node.js') {
            steps {
                sh '''
                    # 安装 nvm
                    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
                    
                    # 加载 nvm
                    export NVM_DIR="$HOME/.nvm"
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                    
                    # 安装并使用 Node.js
                    . "$NVM_DIR/nvm.sh"
                    nvm install ${NODE_VERSION}
                    nvm use ${NODE_VERSION}
                    
                    # 验证版本
                    node -v
                    npm -v
                '''
            }
        }

        stage('检出代码') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/xiangtian888/MBTI-1.0.git']]])
            }
        }
        
        stage('安装依赖') {
            steps {
                sh '''
                    npm cache clean --force
                    npm install
                '''
            }
        }

        stage('构建') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('部署') {
            steps {
                sh '''
                    # 安装 sshpass
                    apt-get update && apt-get install -y sshpass
                    
                    # 创建部署目录
                    sshpass -p "${DEPLOY_PASS}" ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${DEPLOY_DIR}"
                    
                    # 打包应用文件
                    tar -czf dist.tar.gz .next node_modules package.json package-lock.json
                    
                    # 上传到服务器
                    sshpass -p "${DEPLOY_PASS}" scp -o StrictHostKeyChecking=no dist.tar.gz ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_DIR}
                    
                    # 在服务器上安装必要的软件和部署应用
                    sshpass -p "${DEPLOY_PASS}" ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_DIR} && \
                        tar -xzf dist.tar.gz && \
                        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash && \
                        source ~/.nvm/nvm.sh && \
                        nvm install 18 && \
                        npm install -g pm2 && \
                        npm install --production && \
                        pm2 delete mbti || true && \
                        pm2 start npm --name mbti -- start"
                '''
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