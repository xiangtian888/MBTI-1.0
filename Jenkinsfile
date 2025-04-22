pipeline {
    agent any

    environment {
        DEPLOY_HOST = '43.138.144.68'
        DEPLOY_USER = 'ubuntu'
        DEPLOY_DIR = '/home/ubuntu/mbti'
        DEPLOY_PASS = 'e2/ZUCBLt]p3k(}q'
        NODE_VERSION = '16.20.2'
    }

    stages {
        stage('设置 Node.js') {
            steps {
                sh '''
                    # 下载 Node.js 二进制包
                    cd /tmp
                    wget https://nodejs.org/download/release/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz
                    
                    # 解压到 /usr/local
                    sudo tar -C /usr/local --strip-components 1 -xzf node-v${NODE_VERSION}-linux-x64.tar.gz
                    
                    # 清理下载文件
                    rm node-v${NODE_VERSION}-linux-x64.tar.gz
                    
                    # 验证安装
                    node -v
                    npm -v
                    
                    # 配置 npm
                    npm config set registry https://registry.npmmirror.com
                    npm cache clean -f
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
                    
                    # 在服务器上部署应用
                    sshpass -p "${DEPLOY_PASS}" ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_DIR} && \
                        tar -xzf dist.tar.gz && \
                        # 下载并安装 Node.js
                        wget https://nodejs.org/download/release/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz && \
                        sudo mkdir -p /usr/local/lib/nodejs && \
                        sudo tar -xzf node-v${NODE_VERSION}-linux-x64.tar.gz -C /usr/local/lib/nodejs && \
                        # 设置环境变量
                        echo 'export PATH=/usr/local/lib/nodejs/node-v${NODE_VERSION}-linux-x64/bin:\$PATH' >> ~/.profile && \
                        source ~/.profile && \
                        # 安装和配置 pm2
                        sudo npm install -g pm2 --registry=https://registry.npmmirror.com && \
                        # 启动应用
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