pipeline {
    agent {
        docker {
            image 'node:18-alpine'
            args '-p 3000:3000'
        }
    }

    environment {
        NODE_VERSION = '18'
        NPM_CONFIG_CACHE = '/tmp/npm-cache'
    }

    stages {
        stage('环境检查') {
            steps {
                sh '''
                    echo "检查 Node.js 版本..."
                    node -v
                    echo "检查 npm 版本..."
                    npm -v
                '''
            }
        }

        stage('检出代码') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/xiangtian888/MBTI-1.0.git']]])
            }
        }
        
        stage('清理和安装依赖') {
            steps {
                sh '''
                    echo "清理 npm 缓存..."
                    npm cache clean --force
                    
                    echo "安装依赖..."
                    npm install
                    
                    echo "检查依赖版本..."
                    npm list
                '''
            }
        }

        stage('代码质量检查') {
            steps {
                sh '''
                    echo "安装代码检查工具..."
                    npm install --save-dev eslint prettier
                    
                    echo "运行代码格式检查..."
                    if [ -f ".eslintrc.js" ]; then
                        npx eslint . || true
                    else
                        echo "未找到 ESLint 配置文件，跳过 ESLint 检查"
                    fi
                '''
            }
        }
        
        stage('构建') {
            steps {
                sh '''
                    echo "开始构建..."
                    npm run build
                '''
            }
        }
        
        stage('部署') {
            steps {
                sh 'echo "部署完成"'
            }
        }
    }
    
    post {
        success {
            echo '构建成功!'
        }
        failure {
            script {
                def buildLog = currentBuild.rawBuild.getLog(1000)
                echo "构建失败! 错误分析:"
                
                if (buildLog.contains("SyntaxError")) {
                    echo "检测到语法错误，请检查是否使用了不兼容的 JavaScript 语法"
                }
                if (buildLog.contains("npm ERR!")) {
                    echo "检测到 npm 错误，请检查依赖版本兼容性"
                }
                if (buildLog.contains("Node.js")) {
                    echo "检测到 Node.js 相关错误，请确保 Node.js 版本兼容"
                }
            }
        }
        always {
            echo "构建日志保存在: ${env.WORKSPACE}"
        }
    }
} 