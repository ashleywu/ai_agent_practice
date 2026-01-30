# Script to get the actual Docker build error

Write-Host "=== Building with Debug Dockerfile ===" -ForegroundColor Cyan
Write-Host "This will show the actual build errors..." -ForegroundColor Yellow
Write-Host ""

# Build and capture all output
docker build --progress=plain --no-cache -f Dockerfile.debug -t chatgpt-clone-debug . 2>&1 | Tee-Object -FilePath docker_error_full.log

Write-Host ""
Write-Host "=== Extracting Error Messages ===" -ForegroundColor Cyan

# Extract error-related lines
$errors = Get-Content docker_error_full.log | Select-String -Pattern "error|Error|ERROR|failed|Failed|FAILED|TypeError|SyntaxError" -Context 3

if ($errors) {
    Write-Host ""
    Write-Host "Found errors:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host $_ -ForegroundColor Yellow }
} else {
    Write-Host "No obvious errors found in output" -ForegroundColor Yellow
    Write-Host "Check docker_error_full.log for full details" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== Last 50 lines of build output ===" -ForegroundColor Cyan
Get-Content docker_error_full.log -Tail 50
