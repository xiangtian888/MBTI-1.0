# 设置变量
$password = "e2/ZUCBLt]p3k{}q"
$remoteUser = "ubuntu"
$remoteHost = "43.138.144.68"
$server = "${remoteUser}@${remoteHost}"
$sshKeyPath = Join-Path $env:USERPROFILE ".ssh\id_rsa.pub"
$remoteScriptPath = "/tmp/init_ssh.sh"

# 检查必要的命令是否存在
$requiredCommands = @("sshpass", "scp", "ssh")
foreach ($cmd in $requiredCommands) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Error "$cmd is not installed or not in PATH."
        Write-Host "Please install required tools:"
        Write-Host "1. OpenSSH (for scp and ssh)"
        Write-Host "2. sshpass (can be installed via WSL or Git Bash)"
        exit 1
    }
}

# 检查 SSH 公钥文件是否存在
if (-not (Test-Path $sshKeyPath)) {
    Write-Error "SSH public key file not found: $sshKeyPath"
    exit 1
}

# 读取 SSH 公钥内容
$publicKey = Get-Content $sshKeyPath -Raw

# 构建远程命令
$remoteCommands = @"
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo '$publicKey' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
"@

# 将远程命令保存到临时文件
$tempScriptPath = [IO.Path]::GetTempFileName()
$remoteCommands | Out-File -FilePath $tempScriptPath -Encoding ASCII

Write-Host "Uploading SSH public key..."

# 将本地脚本上传到远程主机的 /tmp 目录
$scpProcess = Start-Process -FilePath "sshpass" `
    -ArgumentList "-p", $password, "scp", "-o", "StrictHostKeyChecking=no", $tempScriptPath, "${server}:${remoteScriptPath}" `
    -NoNewWindow -Wait -PassThru

if ($scpProcess.ExitCode -ne 0) {
    Write-Error "Failed to upload script"
    Remove-Item $tempScriptPath
    exit 1
}

# 在远程主机上执行脚本并清理
$sshProcess = Start-Process -FilePath "sshpass" `
    -ArgumentList "-p", $password, "ssh", "-o", "StrictHostKeyChecking=no", $server, "bash ${remoteScriptPath} && rm ${remoteScriptPath}" `
    -NoNewWindow -Wait -PassThru

if ($sshProcess.ExitCode -eq 0) {
    Write-Host "SSH public key uploaded successfully!"
    Write-Host "Now you can use SSH without password."
    
    # 测试SSH免密登录
    Write-Host "Testing passwordless SSH connection..."
    $testProcess = Start-Process -FilePath "ssh" `
        -ArgumentList "-o", "StrictHostKeyChecking=no", $server, "echo 'SSH connection successful'" `
        -NoNewWindow -Wait -PassThru
    
    if ($testProcess.ExitCode -eq 0) {
        Write-Host "SSH key is working correctly!"
    } else {
        Write-Warning "SSH key is uploaded but might not be working. Please check the configuration."
    }
} else {
    Write-Error "Failed to upload SSH public key"
}

# 清理临时文件
Remove-Item $tempScriptPath 