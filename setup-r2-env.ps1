# Script to set up R2 Public URL environment variable
# This script adds VITE_R2_PUBLIC_URL to your .env file

$envFile = ".env"
$r2PublicUrl = "https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev"

Write-Host "Setting up R2 Public URL environment variable..." -ForegroundColor Cyan

# Check if .env file exists
if (Test-Path $envFile) {
    Write-Host "Found existing .env file" -ForegroundColor Green
    
    # Read current content
    $content = Get-Content $envFile
    
    # Check if VITE_R2_PUBLIC_URL already exists
    $exists = $content | Select-String -Pattern "^VITE_R2_PUBLIC_URL="
    
    if ($exists) {
        Write-Host "VITE_R2_PUBLIC_URL already exists. Updating..." -ForegroundColor Yellow
        # Replace existing line
        $updatedContent = $content | ForEach-Object {
            if ($_ -match "^VITE_R2_PUBLIC_URL=") {
                "VITE_R2_PUBLIC_URL=$r2PublicUrl"
            } else {
                $_
            }
        }
        $updatedContent | Set-Content $envFile -Encoding utf8
        Write-Host "✅ Updated VITE_R2_PUBLIC_URL in .env file" -ForegroundColor Green
    } else {
        Write-Host "Adding VITE_R2_PUBLIC_URL to .env file..." -ForegroundColor Yellow
        # Add new line
        Add-Content -Path $envFile -Value "`n# R2 Public URL for Images" -Encoding utf8
        Add-Content -Path $envFile -Value "VITE_R2_PUBLIC_URL=$r2PublicUrl" -Encoding utf8
        Write-Host "✅ Added VITE_R2_PUBLIC_URL to .env file" -ForegroundColor Green
    }
} else {
    Write-Host "Creating new .env file..." -ForegroundColor Yellow
    # Create new .env file
    @"
# R2 Public URL for Images
VITE_R2_PUBLIC_URL=$r2PublicUrl
"@ | Set-Content $envFile -Encoding utf8
    Write-Host "✅ Created .env file with VITE_R2_PUBLIC_URL" -ForegroundColor Green
}

Write-Host "`n✅ Environment variable setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Restart your dev server (npm run dev)" -ForegroundColor White
Write-Host "2. Upload images to R2 bucket in the 'images' folder" -ForegroundColor White
Write-Host "3. For production, add VITE_R2_PUBLIC_URL to Render/Vercel environment variables" -ForegroundColor White
