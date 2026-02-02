# PowerShell script to start the backend server
Write-Host "🚀 Starting KeyVasthu Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Warning: .env file not found!" -ForegroundColor Yellow
    Write-Host "   Creating .env file with default values..." -ForegroundColor Yellow
    @"
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Database Configuration (add your DATABASE_URL here)
# DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Created .env file. Please add your DATABASE_URL!" -ForegroundColor Green
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if port 3001 is already in use
$portInUse = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️  Port 3001 is already in use!" -ForegroundColor Yellow
    Write-Host "   The server might already be running." -ForegroundColor Yellow
    Write-Host "   If not, stop the process using port 3001 and try again." -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit
    }
}

Write-Host "🔧 Starting server on http://localhost:3001" -ForegroundColor Green
Write-Host "💡 Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the server
npm run server
