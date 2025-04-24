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
                sh 'git clone https://github.com/xiangtian888/MBTI-1.0.git .'
                sh 'echo 当前目录内容:'
                sh 'ls -la'
            }
        }
        
        stage('设置Node环境') {
            steps {
                sh 'echo 检查Node.js和npm版本...'
                sh 'node -v'
                sh 'npm -v'
                sh 'echo 安装Node.js 16.x...'
                sh 'curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -'
                sh 'sudo apt-get install -y nodejs'
                sh 'echo 安装后的Node.js版本:'
                sh 'node -v'
                sh 'npm -v'
                sh 'echo 配置npm...'
                sh 'npm config set registry https://registry.npmjs.org/'
                sh 'npm config set fetch-timeout 300000'
            }
        }
        
        stage('安装依赖') {
            steps {
                sh 'echo 安装项目依赖...'
                sh 'npm install --no-audit --no-fund'
                sh 'echo 查看安装结果:'
                sh 'npm list --depth=0'
            }
        }
        
        stage('打包文件') {
            steps {
                sh '''
                echo 检查并打包文件...
                FILES_TO_PACK=""
                
                if [ -d server ]; then
                    echo 找到服务器目录
                    FILES_TO_PACK="$FILES_TO_PACK server"
                fi
                
                if [ -f package.json ]; then
                    echo 找到package.json
                    FILES_TO_PACK="$FILES_TO_PACK package.json"
                fi
                
                if [ -e node_modules ]; then
                    FILES_TO_PACK="$FILES_TO_PACK node_modules"
                    echo 找到文件/目录: node_modules
                fi
                
                if [ -e package-lock.json ]; then
                    FILES_TO_PACK="$FILES_TO_PACK package-lock.json"
                    echo 找到文件/目录: package-lock.json
                fi
                
                if [ -e ecosystem.config.js ]; then
                    FILES_TO_PACK="$FILES_TO_PACK ecosystem.config.js"
                    echo 找到文件/目录: ecosystem.config.js
                fi
                
                if [ -e deploy.sh ]; then
                    FILES_TO_PACK="$FILES_TO_PACK deploy.sh"
                    echo 找到文件/目录: deploy.sh
                fi
                
                if [ -e .next ]; then
                    FILES_TO_PACK="$FILES_TO_PACK .next"
                    echo 找到文件/目录: .next
                fi
                
                if [ -z "$FILES_TO_PACK" ] || ! echo "$FILES_TO_PACK" | grep -q server; then
                    echo "错误: 没有找到必要的文件或目录"
                    exit 1
                fi
                
                echo 开始打包文件: $FILES_TO_PACK
                tar czf deploy.tar.gz $FILES_TO_PACK
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
                    curl -s http://localhost:3000/health
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
    }
}