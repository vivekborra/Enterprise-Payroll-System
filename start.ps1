# Start PayrollPro Application
Write-Host "Starting PayrollPro..." -ForegroundColor Cyan

# 1. Set up Java Environment
$env:JAVA_HOME = "C:\Program Files\Java\jdk-20"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$MavenPath = "C:\Users\lenovo\.m2\wrapper\dists\apache-maven-3.9.6-bin\3311e1d4\apache-maven-3.9.6\bin\mvn.cmd"

# 2. Start the Backend in a new window
Write-Host "Starting Maven Spring Boot Backend on port 8080..." -ForegroundColor Yellow
$backendCmd = "& '$MavenPath' spring-boot:run"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\ADV JAVA\payroll-backend'; $backendCmd"

# Wait a few seconds for backend to start initializing
Start-Sleep -Seconds 5

# 3. Start the Frontend in a new window
Write-Host "Starting Vite React Frontend on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\ADV JAVA\payroll-frontend'; npm run dev"

Write-Host "All services are starting up!" -ForegroundColor Cyan
Write-Host "The frontend will be available at http://localhost:5173" -ForegroundColor Cyan
Write-Host "You can close this window now. Close the separate terminal windows to stop the servers." -ForegroundColor Gray
