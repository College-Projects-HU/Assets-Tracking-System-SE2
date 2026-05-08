#!/bin/bash
# Usage: ./dev-run.sh <service-name>
# Example: ./dev-run.sh auth-service

SERVICE=$1

if [ -z "$SERVICE" ]; then
  echo "❌ Usage: ./dev-run.sh <service-name>"
  echo ""
  echo "   Available services:"
  echo "     auth-service        → port 8081"
  echo "     asset-service       → port 8082"
  echo "     user-service        → port 8083"
  echo "     report-service      → port 8084"
  echo "     maintenance-service → port 8085"
  echo "     notification-service→ port 8086"
  exit 1
fi

declare -A DB_MAP
DB_MAP["auth-service"]="assets_auth_db"
DB_MAP["asset-service"]="assets_asset_db"
DB_MAP["user-service"]="assets_user_db"
DB_MAP["report-service"]="assets_report_db"
DB_MAP["maintenance-service"]="assets_maintenance_db"
DB_MAP["notification-service"]="assets_notification_db"

declare -A PORT_MAP
PORT_MAP["auth-service"]="8081"
PORT_MAP["asset-service"]="8082"
PORT_MAP["user-service"]="8083"
PORT_MAP["report-service"]="8084"
PORT_MAP["maintenance-service"]="8085"
PORT_MAP["notification-service"]="8086"

DB_NAME=${DB_MAP[$SERVICE]}
PORT=${PORT_MAP[$SERVICE]}

if [ -z "$DB_NAME" ]; then
  echo "❌ Unknown service: $SERVICE"
  exit 1
fi

echo "🚀 Starting $SERVICE on port $PORT..."
echo "   DB     → localhost:5432/$DB_NAME"
echo "   Eureka → http://localhost:8761/eureka/"
echo "   Config → http://localhost:8888"
echo ""
echo "   Edit code, then Ctrl+C and re-run this command to reload."
echo ""

./mvnw spring-boot:run -pl "$SERVICE" \
  -Dspring-boot.run.jvmArguments="\
  -DSERVER_PORT=${PORT} \
  -DSPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/${DB_NAME} \
  -DSPRING_DATASOURCE_USERNAME=postgres \
  -DSPRING_DATASOURCE_PASSWORD=postgres \
  -DEUREKA_URL=http://localhost:8761/eureka/ \
  -DCONFIG_SERVER_URL=http://localhost:8888 \
  -DJWT_SECRET=your_super_secret_key_that_should_be_at_least_256_bits_long_for_HS256_algorithm_in_production_environment"
