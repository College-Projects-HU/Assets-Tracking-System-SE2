import os
import glob
import re

backend_dir = r"d:\SE-2 Project\Assets-Tracking-System-SE2\Backend"

# Update docker-compose.yml contexts
compose_file = os.path.join(backend_dir, "docker-compose.yml")
with open(compose_file, "r") as f:
    content = f.read()

# Replace context: ./<module> with context: . and dockerfile: <module>/Dockerfile
modules = ["config-server", "eureka-server", "api-gateway", "auth-service", "asset-service", "user-service", "report-service", "maintenance-service"]

for mod in modules:
    content = re.sub(
        f"context: ./{mod}\\s+dockerfile: Dockerfile",
        f"context: .\n      dockerfile: {mod}/Dockerfile",
        content
    )

with open(compose_file, "w") as f:
    f.write(content)

# Now update each Dockerfile
for mod in modules:
    dockerfile_path = os.path.join(backend_dir, mod, "Dockerfile")
    
    new_dockerfile = f"""# ---- Stage 1: Build ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy root pom
COPY pom.xml .

# Copy all module poms to allow maven to resolve the project tree
COPY config-server/pom.xml config-server/
COPY eureka-server/pom.xml eureka-server/
COPY api-gateway/pom.xml api-gateway/
COPY auth-service/pom.xml auth-service/
COPY asset-service/pom.xml asset-service/
COPY user-service/pom.xml user-service/
COPY report-service/pom.xml report-service/
COPY maintenance-service/pom.xml maintenance-service/

# Go offline for this specific module
RUN mvn -pl {mod} dependency:go-offline -am -B

# Copy the source code for this module
COPY {mod}/src ./{mod}/src

# Build the module
RUN mvn -pl {mod} clean package -DskipTests -B

# ---- Stage 2: Run ----
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/{mod}/target/*.jar app.jar
EXPOSE 8080 8081 8082 8083 8084 8085 8761 8888
ENV JAVA_OPTS="-Xms256m -Xmx512m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
"""
    with open(dockerfile_path, "w") as f:
        f.write(new_dockerfile)

print("Successfully updated docker-compose.yml and all 8 Dockerfiles!")
