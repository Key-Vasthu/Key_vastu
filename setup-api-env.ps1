# Setup API Environment Variables
# This script automatically adds VITE_API_URL to your .env file

$envFile = ".env"
$apiUrl = "http://localhost:3001/api"

Write-Host "`n🔧 Setting up API configuration..." -ForegroundColor Cyan

# Check if .env file exists
if (Test-Path $envFile) {
    Write-Host "✅ .env file found" -ForegroundColor Green
    
    # Read existing content
    $content = Get-Content $envFile -Raw
    
    # Check if VITE_API_URL already exists
    if ($content -match "VITE_API_URL") {
        Write-Host "⚠️  VITE_API_URL already exists in .env file" -ForegroundColor Yellow
        Write-Host "Current value:" -ForegroundColor Yellow
        $content -match "VITE_API_URL=.*" | Out-Null
        if ($matches) {
            Write-Host $matches[0] -ForegroundColor Yellow
        }
        
        $update = Read-Host "Do you want to update it? (y/n)"
        if ($update -eq "y" -or $update -eq "Y") {
            # Remove existing VITE_API_URL line
            $content = $content -replace "VITE_API_URL=.*\r?\n", ""
            # Add new VITE_API_URL
            $content += "`n# API Configuration`nVITE_API_URL=$apiUrl`n"
            $content | Set-Content $envFile -Encoding utf8
            Write-Host "✅ Updated VITE_API_URL to $apiUrl" -ForegroundColor Green
        } else {
            Write-Host "ℹ️  Keeping existing VITE_API_URL" -ForegroundColor Cyan
        }
    } else {
        # Add VITE_API_URL to existing file
        $content += "`n# API Configuration`nVITE_API_URL=$apiUrl`n"
        $content | Set-Content $envFile -Encoding utf8
        Write-Host "✅ Added VITE_API_URL=$apiUrl to .env file" -ForegroundColor Green
    }
} else {
    Write-Host "❌ .env file not found! Creating new .env file..." -ForegroundColor Yellow
    
    # Create new .env file with API configuration
    $newEnvContent = @"
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration
# DATABASE_URL=your_database_url_here

# API Configuration
VITE_API_URL=$apiUrl
"@
    
    $newEnvContent | Set-Content $envFile -Encoding utf8
    Write-Host "✅ Created .env file with API configuration" -ForegroundColor Green
}

Write-Host "`n📝 Configuration:" -ForegroundColor Cyan
Write-Host "VITE_API_URL=$apiUrl" -ForegroundColor Yellow

Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure your backend server is running: npm run server" -ForegroundColor White
Write-Host "2. Restart your frontend dev server: npm run dev" -ForegroundColor White
Write-Host "3. The API will automatically use: $apiUrl" -ForegroundColor White
