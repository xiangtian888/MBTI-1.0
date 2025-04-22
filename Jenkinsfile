pipeline {
    agent any

    environment {
        REMOTE_USER = 'ubuntu'
        REMOTE_HOST = '43.138.144.68'
        DEPLOY_PATH = '/home/ubuntu/mbti'
        NODE_VERSION = '16.20.2'
    }

    stages {
        stage('检查环境') {
            steps {
                echo "开始部署流程..."
                echo "使用的凭证ID: ubuntu-password"
                echo "部署目标服务器: ${REMOTE_USER}@${REMOTE_HOST}"
                echo "部署目录: ${DEPLOY_PATH}"
            }
        }

        stage('测试凭证') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'ubuntu-password', passwordVariable: 'PASSWORD', usernameVariable: 'USERNAME')]) {
                    sh '''
                        echo "凭证测试 - 用户名: $USERNAME"
                        echo "SSH连接测试..."
                        sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "echo '连接成功'"
                    '''
                }
            }
        }

        stage('部署到服务器') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'ubuntu-password', passwordVariable: 'PASSWORD', usernameVariable: 'USERNAME')]) {
                    sh '''
                        echo "开始创建部署目录..."
                        # 创建部署目录
                        sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${DEPLOY_PATH}"
                        
                        echo "开始打包文件..."
                        # 复制文件到服务器
                        cd ${WORKSPACE}
                        tar czf deploy.tar.gz *
                        
                        echo "开始上传文件..."
                        sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no deploy.tar.gz ${REMOTE_USER}@${REMOTE_HOST}:${DEPLOY_PATH}/
                        
                        echo "开始解压文件..."
                        # 解压文件并清理
                        sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "cd ${DEPLOY_PATH} && tar xzf deploy.tar.gz && rm deploy.tar.gz"
                        
                        echo "开始安装依赖和重启服务..."
                        # 安装依赖并重启服务
                        sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "cd ${DEPLOY_PATH} && npm install && pm2 restart mbti || pm2 start npm --name mbti -- start"
                    '''
                }
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