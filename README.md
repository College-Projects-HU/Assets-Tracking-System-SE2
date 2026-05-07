# Assets-Tracking-System-SE2

IT Asset Management System built with Spring Boot microservices, React, PostgreSQL, and Spring Cloud.

## Current State

This repo is only partially complete against the sprint PDFs in `/home/abdunader/Downloads`.

- Implemented: auth, asset management, assignments, reporting, notifications, gateway/config/discovery, and frontend UI screens.
- Incomplete: `user-service`, `maintenance-service`, and most frontend pages are still wired to local mock data.

See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for the detailed audit.

## Prerequisites

- Java 17
- Maven 3.9+
- Node.js 20.19+ or 22.12+
- npm 10+
- PostgreSQL 15+
- Docker + Docker Compose (optional, but recommended)

## Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend URL:
- `http://localhost:5173`

Important:
- The current frontend still uses mock data in several pages.
- `npm run build` requires Node `20.19+`. It fails on Node 18.

## Backend

Use the full setup guide in [Backend/SETUP.md](./Backend/SETUP.md).

Quick start:

```bash
cd Backend
cp .env.example .env
psql -U postgres -h localhost < init-db.sql
mvn test
```

To run services manually, start these first:

1. `config-server`
2. `eureka-server`
3. `auth-service`
4. `asset-service`
5. `report-service`
6. `notification-service`
7. `api-gateway`

Current backend gaps:
- `user-service` is a skeleton only.
- `maintenance-service` is a skeleton only.

## Docker

From `Backend/`:

```bash
docker compose up --build
```

Use this only after creating `.env`.

## Testing

Frontend:

```bash
cd Frontend
npm test
```

Backend:

```bash
cd Backend
mvn test
```

If Maven cannot write to your default local repository, use:

```bash
mvn -Dmaven.repo.local=/tmp/m2 test
```
