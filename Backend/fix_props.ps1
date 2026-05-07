$backendDir = "d:\SE-2 Project\Assets-Tracking-System-SE2\Backend"
$modules = @("api-gateway", "auth-service", "asset-service", "user-service", "report-service", "maintenance-service", "eureka-server")

foreach ($mod in $modules) {
    $propPath = Join-Path $backendDir "$mod/src/main/resources/application.properties"
    if (Test-Path $propPath) {
        $content = Get-Content $propPath -Raw
        
        # Replace config server URL
        $content = $content -replace "configserver:http://localhost:8888", "optional:configserver:`${CONFIG_SERVER_URL:http://localhost:8888}"
        $content = $content -replace "optional:optional:", "optional:"
        
        # Replace eureka server URL
        $content = $content -replace "http://localhost:8761/eureka/", "`${EUREKA_URL:http://localhost:8761/eureka/}"
        
        Set-Content -Path $propPath -Value $content
    }
}

Write-Host "Updated application.properties for all services!"
