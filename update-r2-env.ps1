# Script to add Cloudflare R2 configuration to .env file
param(
    [Parameter(Mandatory=$true)]
    [string]$R2Endpoint,
    
    [Parameter(Mandatory=$true)]
    [string]$R2AccessKeyId,
    
    [Parameter(Mandatory=$true)]
    [string]$R2SecretAccessKey,
    
    [Parameter(Mandatory=$true)]
    [string]$R2BucketName,
    
    [Parameter(Mandatory=$true)]
    [string]$R2PublicUrl
)

$envFile = ".env"

# R2 configuration to add/update
$r2Config = @"
# Cloudflare R2 Configuration
R2_ENDPOINT=$R2Endpoint
R2_ACCESS_KEY_ID=$R2AccessKeyId
R2_SECRET_ACCESS_KEY=$R2SecretAccessKey
R2_BUCKET_NAME=$R2BucketName
R2_PUBLIC_URL=$R2PublicUrl
"@

if (Test-Path $envFile) {
    # Read the current .env file
    $content = Get-Content $envFile -Raw
    
    # Check if R2 configuration already exists
    if ($content -match "R2_ENDPOINT=") {
        Write-Host "⚠️  R2 configuration already exists. Updating..." -ForegroundColor Yellow
        
        # Update existing R2 configuration
        $lines = Get-Content $envFile
        $updatedLines = @()
        $inR2Section = $false
        $r2SectionEnded = $false
        
        foreach ($line in $lines) {
            if ($line -match "^# Cloudflare R2 Configuration" -or $line -match "^R2_") {
                if (-not $inR2Section) {
                    $inR2Section = $true
                    # Add new R2 config
                    $updatedLines += "# Cloudflare R2 Configuration"
                    $updatedLines += "R2_ENDPOINT=$R2Endpoint"
                    $updatedLines += "R2_ACCESS_KEY_ID=$R2AccessKeyId"
                    $updatedLines += "R2_SECRET_ACCESS_KEY=$R2SecretAccessKey"
                    $updatedLines += "R2_BUCKET_NAME=$R2BucketName"
                    $updatedLines += "R2_PUBLIC_URL=$R2PublicUrl"
                    $r2SectionEnded = $true
                }
                # Skip old R2 lines
                continue
            } elseif ($inR2Section -and -not $r2SectionEnded -and ($line -match "^[A-Z_]+=" -or $line.Trim() -eq "")) {
                # End of R2 section
                $r2SectionEnded = $true
                $updatedLines += $line
            } else {
                $updatedLines += $line
            }
        }
        
        $updatedLines | Set-Content $envFile -Encoding utf8
    } else {
        # Append R2 configuration
        Add-Content -Path $envFile -Value "`n$r2Config" -Encoding utf8
    }
    
    Write-Host "✅ Successfully configured R2 in .env file" -ForegroundColor Green
    Write-Host "`nR2 Configuration:" -ForegroundColor Cyan
    Write-Host "R2_ENDPOINT=$R2Endpoint" -ForegroundColor Yellow
    Write-Host "R2_ACCESS_KEY_ID=$R2AccessKeyId" -ForegroundColor Yellow
    Write-Host "R2_SECRET_ACCESS_KEY=***hidden***" -ForegroundColor Yellow
    Write-Host "R2_BUCKET_NAME=$R2BucketName" -ForegroundColor Yellow
    Write-Host "R2_PUBLIC_URL=$R2PublicUrl" -ForegroundColor Yellow
} else {
    Write-Host "❌ .env file not found! Creating new .env file..." -ForegroundColor Yellow
    
    # Create new .env file with R2 configuration
    $newEnvContent = @"
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration
# DATABASE_URL=your_database_url_here

$r2Config
"@
    
    $newEnvContent | Set-Content $envFile -Encoding utf8
    Write-Host "✅ Created .env file with R2 configuration" -ForegroundColor Green
}

Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure your R2 bucket is created in Cloudflare dashboard" -ForegroundColor White
Write-Host "2. Verify the credentials are correct" -ForegroundColor White
Write-Host "3. Restart your server: npm run server" -ForegroundColor White
