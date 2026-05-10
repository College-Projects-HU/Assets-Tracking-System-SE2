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
COPY notification-service/pom.xml notification-service/
COPY maintenance-service/pom.xml maintenance-service/

# Go offline for this specific module
RUN mvn -pl asset-service dependency:go-offline -am -B

# Copy the source code for this module
COPY asset-service/src ./asset-service/src

# Build the module
RUN mvn -pl asset-service clean package -DskipTests -B

# ---- Stage 2: Run ----
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/asset-service/target/*.jar app.jar
ENV JAVA_OPTS="-Xms256m -Xmx512m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
