$backendDir = "d:\SE-2 Project\Assets-Tracking-System-SE2\Backend"
$modules = @("config-server", "eureka-server", "api-gateway", "auth-service", "asset-service", "user-service", "report-service", "maintenance-service")

foreach ($mod in $modules) {
    $pomPath = Join-Path $backendDir "$mod/pom.xml"
    $content = Get-Content $pomPath -Raw
    
    $search = "<artifactId>spring-boot-maven-plugin</artifactId>\s*</plugin>"
    $replace = @"
<artifactId>spring-boot-maven-plugin</artifactId>
                <executions>
                    <execution>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
"@
    if ($content -notmatch "<goal>repackage</goal>") {
        $content = $content -replace $search, $replace
        Set-Content -Path $pomPath -Value $content
    }
}

Write-Host "Updated all module POMs with repackage goal."
