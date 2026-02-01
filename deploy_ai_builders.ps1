# Deploy to ai-builders.space using the integrated deployment API

$apiKey = "sk_a0e0e71f_43e132e8652e5da50151514131a46a1d72ae"
$baseUrl = "https://space.ai-builders.com/backend"

$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

$deploymentRequest = @{
    repo_url = "https://github.com/ashleywu/AI_agent_practice.git"
    service_name = "practicechat"
    branch = "main"
    port = 8000
    env_vars = @{
        AI_BUILDER_API_KEY = $apiKey
        AI_BUILDER_BASE_URL = $baseUrl
    }
} | ConvertTo-Json -Depth 10

Write-Host "=== Deploying to ai-builders.space ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Repository: https://github.com/ashleywu/AI_agent_practice.git" -ForegroundColor Gray
Write-Host "Service Name: practicechat" -ForegroundColor Gray
Write-Host "Branch: main" -ForegroundColor Gray
Write-Host "Port: 8000" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/deployments" -Method Post -Headers $headers -Body $deploymentRequest -ErrorAction Stop
    
    Write-Host "[SUCCESS] Deployment queued successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Service Name: $($response.service_name)" -ForegroundColor Cyan
    Write-Host "Status: $($response.status)" -ForegroundColor Yellow
    Write-Host "Public URL: $($response.public_url)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Deployment will take 5-10 minutes to complete." -ForegroundColor Gray
    Write-Host "Monitor status with:" -ForegroundColor Gray
    Write-Host "  GET $baseUrl/v1/deployments/practicechat" -ForegroundColor Gray
    Write-Host ""
    
    if ($response.streaming_logs) {
        Write-Host "Initial Build Logs:" -ForegroundColor Yellow
        Write-Host $response.streaming_logs -ForegroundColor Gray
    }
} catch {
    Write-Host "[ERROR] Deployment failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    $errorDetails = $_.ErrorDetails.Message
    if ($errorDetails) {
        Write-Host "Details: $errorDetails" -ForegroundColor Red
    }
}
