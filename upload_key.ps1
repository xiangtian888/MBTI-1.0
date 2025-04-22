# 设置变量
$password = "e2/ZUCBLt]p3k{}q"
$server = "root@47.236.36.97"
$sshKeyPath = "C:\Users\22424\.ssh\id_rsa.pub"

# 检查 SSH 公钥文件是否存在
if (-not (Test-Path $sshKeyPath)) {
    Write-Error "SSH 公钥文件不存在: $sshKeyPath"
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

Write-Host "正在上传 SSH 公钥..."

# 使用 scp 上传临时脚本
$scpProcess = Start-Process -FilePath "scp" -ArgumentList "-o StrictHostKeyChecking=no `"$tempScriptPath`" ${server}:/tmp/upload_key.sh" -NoNewWindow -Wait -PassThru

if ($scpProcess.ExitCode -ne 0) {
    Write-Error "上传脚本失败"
    Remove-Item $tempScriptPath
    exit 1
}

# 执行远程命令
$sshProcess = Start-Process -FilePath "ssh" -ArgumentList "-o StrictHostKeyChecking=no $server 'bash /tmp/upload_key.sh && rm /tmp/upload_key.sh'" -NoNewWindow -Wait -PassThru

if ($sshProcess.ExitCode -eq 0) {
    Write-Host "SSH 公钥上传成功！"
} else {
    Write-Error "SSH 公钥上传失败"
}

# 清理临时文件
Remove-Item $tempScriptPath 