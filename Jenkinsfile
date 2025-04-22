pipeline {
    agent any

    environment {
        REMOTE_USER = 'ubuntu'
        REMOTE_HOST = '43.138.144.68'
        DEPLOY_PATH = '/home/ubuntu/mbti'
        NODE_VERSION = '16.20.2'
        REMOTE_PASS = 'e2/ZUCBLt]p3k(}q'
        GIT_REPO = 'https://github.com/xiangtian888/MBTI-1.0.git'
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
                    echo "清理工作目录..."
                    rm -rf *
                '''
            }
        }

        stage('克隆代码') {
            steps {
                sh '''
                    echo "克隆Git仓库..."
                    git clone ${GIT_REPO} .
                    
                    echo "安装依赖..."
                    npm install
                    
                    echo "构建项目..."
                    npm run build || true
                    
                    echo "当前目录内容:"
                    ls -la
                '''
            }
        }

        stage('准备服务器环境') {
            steps {
                sh '''
                    echo "安装Node.js和PM2..."
                    sshpass -p "${REMOTE_PASS}" ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "
                        # 检查Node.js是否已安装
                        if ! command -v node &> /dev/null; then
                            echo '安装Node.js...'
                            curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
                            sudo apt-get install -y nodejs
                        fi
                        
                        # 检查npm是否已安装
                        if ! command -v npm &> /dev/null; then
                            echo '安装npm...'
                            sudo apt-get install -y npm
                        fi
                        
                        # 检查PM2是否已安装
                        if ! command -v pm2 &> /dev/null; then
                            echo '安装PM2...'
                            sudo npm install -g pm2
                        fi
                        
                        # 显示版本信息
                        echo '环境信息:'
                        node -v
                        npm -v
                        pm2 -v
                    "
                    
                    echo "创建部署目录..."
                    sshpass -p "${REMOTE_PASS}" ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${DEPLOY_PATH}"
                '''
            }
        }

        stage('打包文件') {
            steps {
                sh '''
                    echo "检查并打包文件..."
                    FILES_TO_PACK=""
                    
                    # 检查每个文件/目录是否存在
                    for item in .next node_modules package.json package-lock.json public components pages styles app lib config; do
                        if [ -e "$item" ]; then
                            FILES_TO_PACK="$FILES_TO_PACK $item"
                            echo "找到文件/目录: $item"
                        else
                            echo "警告: $item 不存在，将跳过"
                        fi
                    done
                    
                    if [ -z "$FILES_TO_PACK" ]; then
                        echo "错误: 没有找到任何可打包的文件!"
                        exit 1
                    fi
                    
                    echo "开始打包文件: $FILES_TO_PACK"
                    tar czf deploy.tar.gz $FILES_TO_PACK
                    
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
                        export PATH=\$PATH:/usr/local/bin && \
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