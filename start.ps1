Write-Host "Starting AgroGon Backend Server..." -ForegroundColor Green
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory ".\server"

Write-Host "Starting AgroGon Frontend Server..." -ForegroundColor Green
Start-Process -FilePath "npm" -ArgumentList "run", "dev"

Write-Host "Servers are starting in separate windows!" -ForegroundColor Cyan
