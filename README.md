# Asset Service

CRUD + lifecycle FSM + assignments + CSV import.

## Endpoints
| Method | Path | Roles |
|--------|------|-------|
| POST   | /api/assets | ADMIN, ASSET_MANAGER |
| GET    | /api/assets?q=&status=&category=&page=&size=&sort= | any auth |
| GET    | /api/assets/{id} | any auth |
| PUT    | /api/assets/{id} | ADMIN, ASSET_MANAGER |
| DELETE | /api/assets/{id} | ADMIN |
| POST   | /api/assets/{id}/status | ADMIN, ASSET_MANAGER |
| POST   | /api/assets/import (multipart `file`) | ADMIN, ASSET_MANAGER |
| POST   | /api/assignments | ADMIN, ASSET_MANAGER |
| POST   | /api/assignments/{id}/return | ADMIN, ASSET_MANAGER |
| GET    | /api/assignments/asset/{assetId} | any auth |
| GET    | /api/assignments/user/{userId}/active | any auth |

## Lifecycle
```
AVAILABLE ─► ASSIGNED, MAINTENANCE, RETIRED
ASSIGNED  ─► AVAILABLE, MAINTENANCE, RETIRED
MAINTENANCE ─► AVAILABLE, RETIRED
RETIRED   ─► (terminal)
```
Illegal transitions return **HTTP 409**.

## Run standalone (no Eureka/ConfigServer needed)
```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE asset_db;"

# 2. Set env vars (must match auth-service JWT_SECRET)
export DB_HOST=localhost DB_PORT=5432 DB_USER=postgres DB_PASSWORD=postgres
export JWT_SECRET=your_super_secret_key_that_should_be_at_least_256_bits_long_for_HS256_algorithm_in_production

# 3. Build and run
mvn clean package -DskipTests
java -jar target/asset-service-1.0.0.jar
```
The `optional:` prefix on the config-server import lets it boot without the
config server. Eureka is best-effort.

## Tests
```bash
mvn test
```
H2 in-memory; no external services needed.

## Postman
Import `postman/asset-service.postman_collection.json`. Set the `baseUrl` and
`accessToken` collection variables.
