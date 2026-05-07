FROM eclipse-temurin:21-jdk-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY target/user-service.jar app.jar
ENV JAVA_OPTS="-Xms256m -Xmx512m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
