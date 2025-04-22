pipeline {
    agent any

    environment {
        REMOTE_USER = 'ubuntu'
        REMOTE_HOST = '43.138.144.68'
        DEPLOY_PATH = '/home/ubuntu/mbti'
        NODE_VERSION = '16.20.2'
        REMOTE_PASS = 'e2/ZUCBLt]p3k(}q'
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
                    echo "目录内容:"
                    ls -la
                '''
            }
        }

        stage('测试连接') {
            steps {
                sh '''
                    echo "SSH连接测试..."
                    sshpass -p "${REMOTE_PASS}" ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "echo '连接成功'"
                '''
            }
        }

        stage('准备部署') {
            steps {
                sh '''
                    echo "创建部署目录..."
                    sshpass -p "${REMOTE_PASS}" ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${DEPLOY_PATH}"
                '''
            }
        }

        stage('打包文件') {
            steps {
                sh '''
                    echo "当前目录内容:"
                    ls -la
                    
                    echo "创建部署包..."
                    # 确保只打包必要的文件
                    tar czf deploy.tar.gz .next node_modules package.json package-lock.json public components pages styles app lib config
                    
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
                    sshpass -p "${REMOTE_PASS}" ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "cd ${DEPLOY_PATH} && \
                        tar xzf deploy.tar.gz && \
                        rm deploy.tar.gz && \
                        npm install && \
                        pm2 restart mbti || pm2 start npm --name mbti -- start"
                    
                    echo "清理本地部署包..."
                    rm deploy.tar.gz
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