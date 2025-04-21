pipeline {
    agent any

    stages {
        stage('检出代码') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/xiangtian888/MBTI-1.0.git']]])
            }
        }
        
        stage('安装依赖') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('构建') {
            steps {
                sh 'npm run build'
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
            echo '构建失败!'
        }
    }
} 