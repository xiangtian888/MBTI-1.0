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

        stage('部署到服务器') {
            steps {
                sh '''
                    echo "开始创建部署目录..."
                    # 创建部署目录
                    sshpass -p "${REMOTE_PASS}" ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${DEPLOY_PATH}"
                    
                    echo "开始打包文件..."
                    # 复制文件到服务器
                    cd ${WORKSPACE}
                    tar czf deploy.tar.gz *
                    
                    echo "开始上传文件..."
                    sshpass -p "${REMOTE_PASS}" scp -o StrictHostKeyChecking=no deploy.tar.gz ${REMOTE_USER}@${REMOTE_HOST}:${DEPLOY_PATH}/
                    
                    echo "开始解压文件..."
                    # 解压文件并清理
                    sshpass -p "${REMOTE_PASS}" ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "cd ${DEPLOY_PATH} && tar xzf deploy.tar.gz && rm deploy.tar.gz"
                    
                    echo "开始安装依赖和重启服务..."
                    # 安装依赖并重启服务
                    sshpass -p "${REMOTE_PASS}" ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "cd ${DEPLOY_PATH} && npm install && pm2 restart mbti || pm2 start npm --name mbti -- start"
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