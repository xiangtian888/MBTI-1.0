pipeline {
    agent any

    environment {
        REMOTE_HOST = '43.138.144.68'
        REMOTE_USER = 'ubuntu'
        REMOTE_DIR = '/home/ubuntu/mbti'
        NODE_VERSION = '16.20.2'
    }

    stages {
        stage('Deploy') {
            steps {
                sh '''
                    # 创建远程目录
                    ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_DIR}"
                    
                    # 打包项目文件
                    tar -czf dist.tar.gz .next node_modules package.json package-lock.json
                    
                    # 上传文件到服务器
                    scp -o StrictHostKeyChecking=no dist.tar.gz ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}
                    
                    # 在远程服务器上执行部署命令
                    ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_DIR} && \
                        # 解压文件
                        tar -xzf dist.tar.gz && \
                        # 下载并安装 Node.js
                        wget https://nodejs.org/download/release/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz && \
                        sudo tar -xzf node-v${NODE_VERSION}-linux-x64.tar.gz -C /usr/local && \
                        sudo ln -sf /usr/local/node-v${NODE_VERSION}-linux-x64/bin/node /usr/local/bin/node && \
                        sudo ln -sf /usr/local/node-v${NODE_VERSION}-linux-x64/bin/npm /usr/local/bin/npm && \
                        # 安装和配置 pm2
                        sudo npm install -g pm2 --registry=https://registry.npmmirror.com && \
                        sudo ln -sf /usr/local/node-v${NODE_VERSION}-linux-x64/bin/pm2 /usr/local/bin/pm2 && \
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