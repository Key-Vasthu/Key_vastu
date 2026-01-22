# Script to update DATABASE_URL in .env file
param(
    [Parameter(Mandatory=$true)]
    [string]$ConnectionString
)

$envFile = ".env"

if (Test-Path $envFile) {
    # Read the current .env file
    $content = Get-Content $envFile
    
    # Replace the DATABASE_URL line
    $updatedContent = $content | ForEach-Object {
        if ($_ -match "^DATABASE_URL=") {
            "DATABASE_URL=$ConnectionString"
        } else {
            $_
        }
    }
    
    # Write back to file
    $updatedContent | Set-Content $envFile -Encoding utf8
    
    Write-Host "✅ Successfully updated DATABASE_URL in .env file" -ForegroundColor Green
    Write-Host "`nUpdated line:" -ForegroundColor Cyan
    Write-Host "DATABASE_URL=$ConnectionString" -ForegroundColor Yellow
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}


















