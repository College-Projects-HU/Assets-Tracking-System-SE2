# Project Status Audit

This repository is not fully complete against the sprint PDFs.

What is implemented:
- Frontend shell with login, dashboard, assets, assignments, maintenance, reports, and staff pages.
- `auth-service` with register, login, refresh, logout, JWT generation, role seeding, and basic exception handling.
- `asset-service` with asset CRUD, search/filter, status transitions, CSV import, and assignment/return workflows.
- `user-service` with profile, admin user listing, role updates, and soft-delete through internal auth-service APIs.
- `maintenance-service` with ticket creation, lifecycle management, notes, and reporting feed endpoints.
- `report-service` with dashboard aggregation, inventory/maintenance/warranty reports, CSV export, and audit-log endpoints.
- `notification-service` with create, unread list, and mark-as-read endpoints.
- Spring Cloud infrastructure: config server, Eureka server, API gateway, Maven multi-module setup, Dockerfiles, and compose stack.

What is still missing or incomplete relative to the sprint plans:
- Most frontend pages still use local mock data from `Frontend/src/lib/mock-data.ts` instead of the backend APIs.
- The frontend service clients and backend API coverage are only partially aligned.
- End-to-end RBAC coverage, Postman completion, and full integration flows described in the sprint PDFs are not verifiable from the current repo state.

What was fixed in this pass:
- Added internal asset and active-assignment endpoints in `asset-service` so `report-service` can consume real asset data instead of pointing at a non-existent assignment service.
- Aligned `report-service` assignment Feign client with `asset-service`.
- Implemented `maintenance-service` backend APIs and `user-service` user-management APIs.
- Added explicit frontend Node version requirements and a realistic run/test guide.

Recommended submission framing:
- Present the project as partially delivered.
- Demo the implemented modules: auth, assets, assignments, reporting, notifications, and the frontend UI.
- State clearly that maintenance, user management, and full frontend-to-backend wiring remain incomplete.
