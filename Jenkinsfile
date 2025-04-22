pipeline {
    agent any

    environment {
        REMOTE_HOST = 'ubuntu@43.138.144.68'
        DEPLOY_PATH = '/home/ubuntu/mbti'
        NODE_VERSION = '16.20.2'
    }

    stages {
        stage('部署到服务器') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'ubuntu-password', usernameVariable: 'USERNAME', passwordVariable: 'SSHPASS')]) {
                    sh '''
                        # 创建部署目录
                        sshpass -e ssh -o StrictHostKeyChecking=no ${REMOTE_HOST} "mkdir -p ${DEPLOY_PATH}"
                        
                        # 复制文件到服务器
                        cd ${WORKSPACE}
                        tar czf deploy.tar.gz *
                        sshpass -e scp -o StrictHostKeyChecking=no deploy.tar.gz ${REMOTE_HOST}:${DEPLOY_PATH}/
                        
                        # 解压文件并清理
                        sshpass -e ssh -o StrictHostKeyChecking=no ${REMOTE_HOST} "cd ${DEPLOY_PATH} && tar xzf deploy.tar.gz && rm deploy.tar.gz"
                        
                        # 安装依赖并重启服务
                        sshpass -e ssh -o StrictHostKeyChecking=no ${REMOTE_HOST} "cd ${DEPLOY_PATH} && npm install && pm2 restart mbti || pm2 start npm --name mbti -- start"
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo '部署成功！'
        }
        failure {
            echo '部署失败！'
        }
    }
}