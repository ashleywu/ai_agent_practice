# 结束占用8000端口的进程
Write-Host "正在查找占用8000端口的进程..." -ForegroundColor Yellow

$processes = netstat -ano | Select-String ":8000" | Select-String "LISTENING"
$pids = @()

foreach ($line in $processes) {
    $parts = $line -split '\s+'
    $pid = $parts[-1]
    if ($pid -and $pid -match '^\d+$') {
        $pids += [int]$pid
    }
}

$pids = $pids | Select-Object -Unique

if ($pids.Count -eq 0) {
    Write-Host "没有找到占用8000端口的进程" -ForegroundColor Green
    exit
}

Write-Host "找到以下进程占用8000端口:" -ForegroundColor Yellow
foreach ($pid in $pids) {
    $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Host "  PID: $pid, 进程名: $($proc.ProcessName), 路径: $($proc.Path)" -ForegroundColor Cyan
    } else {
        Write-Host "  PID: $pid (进程不存在)" -ForegroundColor Red
    }
}

Write-Host "`n是否要结束这些进程? (Y/N): " -ForegroundColor Yellow -NoNewline
$confirm = Read-Host

if ($confirm -eq 'Y' -or $confirm -eq 'y') {
    foreach ($pid in $pids) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-Host "已结束进程 PID: $pid" -ForegroundColor Green
        } catch {
            Write-Host "无法结束进程 PID: $pid - 可能需要管理员权限" -ForegroundColor Red
            Write-Host "错误: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Start-Sleep -Seconds 2
    Write-Host "`n检查端口8000状态..." -ForegroundColor Yellow
    $remaining = netstat -ano | Select-String ":8000" | Select-String "LISTENING"
    if ($remaining) {
        Write-Host "警告: 仍有进程占用8000端口" -ForegroundColor Red
    } else {
        Write-Host "端口8000已释放!" -ForegroundColor Green
    }
} else {
    Write-Host "操作已取消" -ForegroundColor Yellow
}
