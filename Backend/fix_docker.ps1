$backendDir = "d:\SE-2 Project\Assets-Tracking-System-SE2\Backend"

# Update docker-compose.yml contexts
$composeFile = Join-Path $backendDir "docker-compose.yml"
$content = Get-Content $composeFile -Raw

$modules = @("config-server", "eureka-server", "api-gateway", "auth-service", "asset-service", "user-service", "report-service", "maintenance-service")

foreach ($mod in $modules) {
    $search = "context:\s*\./$mod\s*\r?\n\s*dockerfile:\s*Dockerfile"
    $replace = "context: .`n      dockerfile: $mod/Dockerfile"
    $content = $content -replace $search, $replace
}

Set-Content -Path $composeFile -Value $content

# Update Dockerfiles
foreach ($mod in $modules) {
    $dockerfilePath = Join-Path $backendDir "$mod/Dockerfile"
    
    $newDockerfile = @"
# ---- Stage 1: Build ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy root pom
COPY pom.xml .

# Copy all module poms
COPY config-server/pom.xml config-server/
COPY eureka-server/pom.xml eureka-server/
COPY api-gateway/pom.xml api-gateway/
COPY auth-service/pom.xml auth-service/
COPY asset-service/pom.xml asset-service/
COPY user-service/pom.xml user-service/
COPY report-service/pom.xml report-service/
COPY maintenance-service/pom.xml maintenance-service/

# Go offline for this specific module
RUN mvn -pl $mod dependency:go-offline -am -B

# Copy the source code for this module
COPY $mod/src ./$mod/src

# Build the module
RUN mvn -pl $mod clean package -DskipTests -B

# ---- Stage 2: Run ----
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/$mod/target/*.jar app.jar
ENV JAVA_OPTS="-Xms256m -Xmx512m"
ENTRYPOINT ["sh", "-c", "java `$JAVA_OPTS -jar app.jar"]
"@
    
    Set-Content -Path $dockerfilePath -Value $newDockerfile
}

Write-Host "Successfully updated docker-compose.yml and all 8 Dockerfiles!"
