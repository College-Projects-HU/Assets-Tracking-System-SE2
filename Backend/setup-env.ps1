# Load environment variables from .env file
$envFile = ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        # Skip empty lines and comments
        if ($_ -match '^\s*([^#=]+)\s*=\s*(.+)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "env:$key" -Value "$value" -Force
            Write-Host "Set $key" -ForegroundColor Green
        }
    }
    Write-Host "Environment variables loaded from $envFile" -ForegroundColor Green
} else {
    Write-Host "Error: $envFile not found in current directory" -ForegroundColor Red
    Write-Host "Please run this script from the Backend directory" -ForegroundColor Yellow
}
