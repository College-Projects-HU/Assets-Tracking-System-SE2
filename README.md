# IT Asset Tracking & Management System (ITAMS)

A full-stack enterprise asset management system built as a microservices architecture for the SE2 course project. It allows organizations to track IT assets, manage assignments, handle maintenance tickets, receive real-time notifications, and generate audit-trail reports — all enforced through role-based access control.

---

## Table of Contents

- [System Overview](#system-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Roles & Permissions](#roles--permissions)
- [Key Features](#key-features)
- [Prerequisites](#prerequisites)
- [Running the Project](#running-the-project)
- [Default Accounts](#default-accounts)
- [Project Structure](#project-structure)
- [AOP & Audit Logging](#aop--audit-logging)
- [Notifications](#notifications)
- [API Reference](#api-reference)

---

## System Overview

ITAMS tracks the full lifecycle of IT assets from procurement through retirement. Three user roles interact with the system:

- **Admin** — manages users, views the system-wide audit log and reports
- **Asset Manager** — creates/assigns/returns assets, manages maintenance tickets
- **Employee** — views their assigned assets, submits maintenance tickets, receives notifications

---

## Architecture

The backend is composed of **7 independent Spring Boot microservices** behind a single API Gateway:

```
Frontend (React)
      │
      ▼
API Gateway :8080  ←── JWT authentication & header forwarding
      │
      ├── auth-service        :8081   User registration, login, JWT
      ├── asset-service       :8082   Assets + assignments
      ├── user-service        :8083   User profiles & management
      ├── report-service      :8084   Reports, audit log (PostgreSQL sink)
      ├── maintenance-service :8085   Maintenance tickets
      ├── notification-service:8086   In-app notifications
      │
      ├── eureka-server       :8761   Service registry
      └── config-server       :8888   Centralised configuration
```

All services register with **Eureka** for service discovery and load balancing. The **Config Server** serves per-service `application.properties` from its classpath. Services communicate with each other via **OpenFeign** clients resolved through Eureka (bypassing the gateway for internal calls).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| API Gateway | Spring Cloud Gateway |
| Microservices | Spring Boot 3.2, Spring Security, Spring Data JPA |
| Service Discovery | Netflix Eureka |
| Config Management | Spring Cloud Config Server |
| Inter-service Calls | OpenFeign |
| AOP | Spring AOP (`@Around`, `@AfterReturning`) |
| Database | PostgreSQL 15 (one database per service) |
| Auth | JWT (stateless, HS256) |
| Containerisation | Docker, Docker Compose |

---

## Roles & Permissions

| Feature | Admin | Asset Manager | Employee |
|---|:---:|:---:|:---:|
| View assets | ✅ | ✅ | ✅ (own only) |
| Create / update / delete assets | ✅ | ✅ | ❌ |
| Bulk import assets | ✅ | ✅ | ❌ |
| Assign / return assets | ✅ | ✅ | ❌ |
| Create maintenance ticket | ❌ | ❌ | ✅ |
| Update ticket status / add notes | ❌ | ✅ | ❌ |
| View tickets | ❌ | ✅ (all) | ✅ (own) |
| View audit log | ✅ | ❌ | ❌ |
| View reports | ✅ | ✅ | ❌ |
| Manage users (role/status) | ✅ | ❌ | ❌ |
| Receive notifications | ✅ | ✅ | ✅ |

---

## Key Features

1. **Asset lifecycle management** — create, assign, return, retire, bulk-import via CSV
2. **Maintenance ticketing** — employees raise tickets, managers update status and add notes; resolved tickets automatically free the asset
3. **Role-based access control** — enforced at the gateway (JWT) and at the method level (`@PreAuthorize`)
4. **AOP-based audit log** — every state-changing operation on assets and tickets is intercepted by an `@AfterReturning` aspect, which writes a structured audit entry to `report-service` via Feign. Entries include who performed the action, what changed, and when.
5. **Real-time notifications** — six event types are automatically dispatched: asset assigned, asset returned, ticket created (employee + all managers), status updated, note added
6. **Reports & exports** — full inventory, maintenance summary (ticket audit trail), warranty-expiry list, and the complete audit log — all exportable as CSV
7. **Centralised configuration** — all datasource URLs, JPA settings, and Feign URLs are served by Config Server and overridden by Docker environment variables at runtime

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) ≥ 24 with Docker Compose plugin
- Ports **3000, 5050, 8080–8086, 8761, 8888** free on the host

---

## Running the Project

### 1. Clone the repository

```bash
git clone <repo-url>
cd Assets-Tracking-System-SE2/Backend
```

### 2. Build all service JARs

```bash
./mvnw -DskipTests package
```

### 3. Start all containers

```bash
docker compose up --build -d
```

Startup order is enforced by `depends_on` health-checks. Allow ~2 minutes for all services to become healthy.

### 4. Verify everything is up

```bash
docker compose ps
```

All containers should show `(healthy)`.

### 5. Open the application

| URL | What |
|---|---|
| `http://localhost:3000` | React frontend |
| `http://localhost:8080/api` | API Gateway |
| `http://localhost:8761` | Eureka dashboard |
| `http://localhost:5050` | pgAdmin (admin@admin.com / admin) |

---

## Default Accounts

The auth-service seeds the following accounts on first startup:

| Email | Password | Role |
|---|---|---|
| `admin@itams.com` | `admin123` | ADMIN |
| `manager@itams.com` | `manager123` | ASSET_MANAGER |
| `employee@itams.com` | `employee123` | EMPLOYEE |

---

## Project Structure

```
Assets-Tracking-System-SE2/
├── Backend/
│   ├── api-gateway/            Spring Cloud Gateway + JWT filter
│   ├── auth-service/           Registration, login, token management
│   ├── asset-service/          Asset CRUD + assignment management
│   │   └── aspect/             LoggingAspect — AOP audit + logging
│   ├── user-service/           User profile & admin user management
│   ├── report-service/         Reports, audit log persistence
│   ├── maintenance-service/    Maintenance ticket lifecycle
│   │   └── aspect/             LoggingAspect — AOP audit + logging
│   ├── notification-service/   In-app notification storage & retrieval
│   ├── config-server/          Spring Cloud Config (classpath-based)
│   │   └── resources/config/   Per-service .properties files
│   ├── eureka-server/          Service registry
│   ├── docker-compose.yml
│   └── init-db.sql             Creates all PostgreSQL databases
└── Frontend/
    ├── src/
    │   ├── components/         AppSidebar, StatCard, StatusBadge, …
    │   ├── hooks/              useNotifications (polling hook)
    │   ├── pages/              DashboardPage, AssetsPage, HistoryPage, …
    │   ├── services/           API service layer (Axios)
    │   └── store/              Zustand auth store
    └── Dockerfile
```

---

## AOP & Audit Logging

Both `asset-service` and `maintenance-service` contain a `LoggingAspect` (in the `aspect` package) built with **Spring AOP**:

- **`@Around`** — wraps all controller and service methods to log execution time, inputs, and outputs
- **`@AfterReturning`** — fires after any `create*`, `update*`, `delete*`, `assign*`, `return*`, `add*` controller method, extracts a human-readable summary from the response DTO via reflection, and POSTs an `AuditLogRequest` to `report-service` via Feign

`report-service` persists every entry in the `audit_logs` table (`assets_report_db`):

| Column | Description |
|---|---|
| `actor` | Email of the user who performed the action (or `"System"` for internal calls) |
| `action` | `Created` / `Updated` / `Deleted` / `Assigned` / `Returned` / `Bulk Imported` |
| `resource_type` | `Asset` / `Assignment` / `MaintenanceTicket` |
| `resource_id` | Database ID of the affected record |
| `details` | Human-readable sentence (e.g. *"Asset 'MacBook Pro' assigned to Jane Doe."*) |
| `created_at` | UTC timestamp |

The admin can view and filter the audit log at `/history` and export it as CSV.

---

## Notifications

Six events are dispatched automatically by the service layer and persisted in the `notifications` table (`assets_notification_db`):

| Event | Recipient |
|---|---|
| Asset assigned | The employee who received the asset |
| Asset returned | The employee who had the asset |
| Maintenance ticket created | The employee who raised it (confirmation) |
| Maintenance ticket created | All active asset managers |
| Ticket status updated | The employee who raised the ticket |
| Notes added to ticket | The employee who raised the ticket |

The frontend polls `GET /api/notifications` every 30 seconds. The notification bell in the sidebar shows an unread count badge and opens a popover panel with the message history. Clicking a notification marks it as read; "Mark all read" is also available.

---

## API Reference

See **[API_REFERENCE.md](./API_REFERENCE.md)** for the complete endpoint listing with request/response examples for all 6 services.
