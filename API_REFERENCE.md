# IT Asset Tracking & Management System — API Reference

All requests go through the **API Gateway** at `http://localhost:8080`.  
Authenticated endpoints require `Authorization: Bearer <access_token>` in the request header.  
The gateway validates the JWT and forwards `X-User-Email`, `X-User-Role`, and `X-User-Id` headers to downstream services.

---

## Authentication & Roles

| Role | Value sent in JWT |
|---|---|
| Administrator | `ADMIN` |
| Asset Manager | `ASSET_MANAGER` |
| Employee | `EMPLOYEE` |

Permission icons used below:

- 🔓 No authentication required  
- 🔐 Any authenticated user  
- 🟦 `ADMIN` only  
- 🟧 `ASSET_MANAGER` only  
- 🟩 `EMPLOYEE` only  
- 🟦🟧 `ADMIN` or `ASSET_MANAGER`  
- 🟧🟩 `ASSET_MANAGER` or `EMPLOYEE`

---

## Base URL

```
http://localhost:8080/api
```

---

## 1. Authentication Service

> Routed to `auth-service` on port **8081**

---

### POST `/api/auth/register`
🔓 Create a new user account.

**Request body**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "EMPLOYEE"
}
```

| Field | Type | Rules |
|---|---|---|
| `fullName` | string | 2–100 characters, required |
| `email` | string | valid email, required |
| `password` | string | 6–100 characters, required |
| `role` | string | `ADMIN` / `ASSET_MANAGER` / `EMPLOYEE`, required |

**Response `200 OK`**
```json
{
  "accessToken":  "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "tokenType":    "Bearer",
  "expiresIn":    86400000
}
```

---

### POST `/api/auth/login`
🔓 Authenticate and receive tokens.

**Request body**
```json
{
  "email":    "jane@example.com",
  "password": "secret123"
}
```

**Response `200 OK`** — same shape as `/register`

---

### POST `/api/auth/refresh`
🔓 Exchange a refresh token for a new access token.

**Request body**
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response `200 OK`** — same shape as `/register`

---

### POST `/api/auth/logout`
🔐 Blacklist the current access token.

**Headers** — `Authorization: Bearer <access_token>`

**Response `200 OK`**
```json
{ "message": "Logged out successfully" }
```

---

## 2. User Service

> Routed to `user-service` on port **8083**

---

### GET `/api/users/profile`
🔐 Get the profile of the currently authenticated user.

**Response `200 OK`**
```json
{
  "id":       1,
  "fullName": "Jane Doe",
  "email":    "jane@example.com",
  "role":     { "id": 3, "name": "ROLE_EMPLOYEE" },
  "enabled":  true
}
```

---

### PUT `/api/users/profile`
🔐 Update the authenticated user's display name.

**Request body**
```json
{ "fullName": "Jane Smith" }
```

**Response `200 OK`** — updated user object

---

### GET `/api/users`
🟦🟧 List all users, optionally filtered by role.

**Query params**

| Param | Type | Example |
|---|---|---|
| `role` | string (optional) | `EMPLOYEE` |

**Response `200 OK`**
```json
[
  {
    "id":       2,
    "fullName": "Bob Manager",
    "email":    "bob@example.com",
    "role":     { "id": 2, "name": "ROLE_ASSET_MANAGER" },
    "enabled":  true
  }
]
```

---

### PUT `/api/users/{id}/role`
🟦 Change a user's role. Cannot target the requesting admin's own account.

**Query params**

| Param | Type | Example |
|---|---|---|
| `role` | string | `ASSET_MANAGER` |

**Response `200 OK`** — updated user object

---

### DELETE `/api/users/{id}`
🟦 Deactivate (soft-delete) a user. Cannot target self.

**Response `204 No Content`**

---

### PUT `/api/users/{id}/activate`
🟦 Re-activate a previously deactivated user. Cannot target self.

**Response `200 OK`** — updated user object

---

## 3. Asset Service

> Assets and assignments are both routed to `asset-service` on port **8082**

---

### POST `/api/assets`
🟦🟧 Create a new asset.

**Request body**
```json
{
  "name":          "MacBook Pro 14\"",
  "category":      "HARDWARE",
  "location":      "Floor 3 - Desk 12",
  "purchaseDate":  "2024-01-15",
  "warrantyExpiry": "2027-01-15"
}
```

| Field | Type | Rules |
|---|---|---|
| `name` | string | required |
| `category` | string | `HARDWARE` / `SOFTWARE_LICENSE`, required |
| `location` | string | optional |
| `purchaseDate` | date (ISO) | required |
| `warrantyExpiry` | date (ISO) | required |

**Response `201 Created`**
```json
{
  "id":              5,
  "name":            "MacBook Pro 14\"",
  "category":        "HARDWARE",
  "status":          "AVAILABLE",
  "assignedUserId":  null,
  "assignedUserName": null,
  "location":        "Floor 3 - Desk 12",
  "purchaseDate":    "2024-01-15",
  "warrantyExpiry":  "2027-01-15"
}
```

---

### GET `/api/assets`
🔐 List assets (paginated). Employees only see assets assigned to them.

**Query params**

| Param | Type | Default |
|---|---|---|
| `category` | string | — |
| `status` | string | — |
| `assignedUserId` | long | — |
| `page` | int | 0 |
| `size` | int | 20 |

**Response `200 OK`** — Spring `Page<AssetDTO>`

---

### GET `/api/assets/{id}`
🔐 Get a single asset by ID.

**Response `200 OK`** — `AssetDTO`

---

### PUT `/api/assets/{id}`
🟦🟧 Update asset details.

**Request body** — same shape as `POST /api/assets`

**Response `200 OK`** — updated `AssetDTO`

---

### DELETE `/api/assets/{id}`
🟦🟧 Permanently delete an asset.

**Response `204 No Content`**

---

### PUT `/api/assets/{id}/status`
🟦🟧 Manually change an asset's status.

**Query params**

| Param | Allowed values |
|---|---|
| `status` | `AVAILABLE` / `ASSIGNED` / `UNDER_MAINTENANCE` / `RETIRED` / `LOST_STOLEN` |

**Response `200 OK`** — updated `AssetDTO`

---

### POST `/api/assets/bulk-import`
🟦🟧 Bulk-import assets from a CSV file.

**Request** — `multipart/form-data` with field `file`

**Response `200 OK`**
```json
{
  "imported": 12,
  "failed":    1,
  "errors": ["Row 4: invalid category"]
}
```

---

## 4. Assignment Service

> Served by `asset-service` on port **8082**, routed via `/api/assignments`

---

### POST `/api/assignments`
🟦🟧 Assign an available asset to a user.

**Request body**
```json
{
  "assetId":            5,
  "userId":             3,
  "userName":           "Jane Doe",
  "expectedReturnDate": "2025-06-30",
  "notes":              "Temporary assignment for project Alpha"
}
```

**Rules**
- Asset must have status `AVAILABLE`
- No active assignment may already exist for the asset

**Response `201 Created`**
```json
{
  "id":                 10,
  "assetId":            5,
  "assetName":          "MacBook Pro 14\"",
  "userId":             3,
  "userName":           "Jane Doe",
  "assignedDate":       "2025-04-01",
  "expectedReturnDate": "2025-06-30",
  "actualReturnDate":   null,
  "status":             "ACTIVE",
  "notes":              "Temporary assignment for project Alpha"
}
```

> **Side effects**: asset status → `ASSIGNED`; employee receives an `ASSET_ASSIGNED` notification.

---

### PUT `/api/assignments/{id}/return`
🟦🟧 Mark an assignment as returned.

**Response `200 OK`** — updated assignment with `status: "RETURNED"`

> **Side effects**: asset status → `AVAILABLE`; employee receives an `ASSET_RETURNED` notification.

---

### GET `/api/assignments`
🟦🟧 List all assignments (paginated).

**Query params**

| Param | Type | Default |
|---|---|---|
| `userId` | long | — |
| `status` | string (`ACTIVE` / `RETURNED`) | — |
| `page` | int | 0 |
| `size` | int | 20 |

**Response `200 OK`** — Spring `Page<AssignmentDTO>`

---

## 5. Maintenance Service

> Routed to `maintenance-service` on port **8085**

---

### POST `/api/maintenance`
🟩 Create a maintenance ticket for an asset assigned to the requesting employee.

**Request body**
```json
{
  "assetId":      5,
  "priority":     "HIGH",
  "description":  "Screen flickering when battery below 20%",
  "scheduledDate": "2025-05-01T09:00:00"
}
```

| Field | Allowed values |
|---|---|
| `priority` | `LOW` / `MEDIUM` / `HIGH` / `CRITICAL` |

**Response `201 Created`**
```json
{
  "id":                1,
  "ticketId":          "MNT-A1B2C3D4",
  "assetId":           5,
  "reportedByUserId":  3,
  "technicianId":      null,
  "status":            "OPEN",
  "priority":          "HIGH",
  "description":       "Screen flickering when battery below 20%",
  "notes":             null,
  "resolutionDetails": null,
  "cost":              null,
  "createdAt":         "2025-04-01T10:30:00",
  "resolvedAt":        null,
  "scheduledDate":     "2025-05-01T09:00:00"
}
```

> **Side effects**: asset status → `UNDER_MAINTENANCE`; employee receives `MAINTENANCE_CREATED` notification; all asset managers receive `MAINTENANCE_NEW_TICKET` notification.

---

### PUT `/api/maintenance/{id}/status`
🟧 Update a ticket's status.

**Query params**

| Param | Allowed values |
|---|---|
| `status` | `IN_PROGRESS` / `RESOLVED` / `CLOSED` |

**Allowed transitions**

| From | To |
|---|---|
| `OPEN` | `IN_PROGRESS`, `CLOSED` |
| `IN_PROGRESS` | `RESOLVED`, `CLOSED` |
| `RESOLVED` | `CLOSED` |

**Response `200 OK`** — updated ticket

> **Side effects**: if status → `RESOLVED`, asset status → `AVAILABLE`; employee receives `MAINTENANCE_STATUS_UPDATED` notification.

---

### POST `/api/maintenance/{id}/notes`
🟧 Append a progress note to a ticket.

**Request body**
```json
{ "notes": "Replaced display cable. Monitoring for 24 hours." }
```

**Response `200 OK`** — updated ticket with note appended

> **Side effects**: employee receives `MAINTENANCE_NOTE_ADDED` notification.

---

### GET `/api/maintenance`
🟧🟩 List tickets. Asset managers see all; employees see only their own.

**Query params** — `page`, `size` (Spring Pageable)

**Response `200 OK`** — Spring `Page<MaintenanceTicketDTO>`

---

### GET `/api/maintenance/my`
🟩 Get only the authenticated employee's own tickets.

**Response `200 OK`** — Spring `Page<MaintenanceTicketDTO>`

---

### GET `/api/maintenance/{id}`
🟧🟩 Get a single ticket by numeric ID.

**Response `200 OK`** — `MaintenanceTicketDTO`

---

### GET `/api/maintenance/upcoming`
🟧 List tickets with a future `scheduledDate`, ordered by date ascending.

**Response `200 OK`** — Spring `Page<MaintenanceTicketDTO>`

---

## 6. Report Service

> Routed to `report-service` on port **8084**

---

### GET `/api/reports/dashboard-stats`
🔐 Aggregated statistics computed from live asset and ticket data.

**Response `200 OK`**
```json
{
  "assetSummary": [
    { "category": "HARDWARE", "statusCounts": { "AVAILABLE": 10, "ASSIGNED": 5 } }
  ],
  "activeAssignments": [
    { "id": 10, "assetId": 5, "assigneeId": 3, "assigneeName": "Jane Doe", "status": "ACTIVE" }
  ],
  "maintenanceCost": {
    "total": 1500.0,
    "byCategory": { "HIGH": 900.0, "MEDIUM": 600.0 }
  }
}
```

---

### GET `/api/reports/full-inventory`
🔐 Full asset list with optional filters.

**Query params**

| Param | Type |
|---|---|
| `category` | string |
| `status` | string |
| `startDate` | ISO date |
| `endDate` | ISO date |

**Response `200 OK`** — array of inventory items

---

### GET `/api/reports/full-inventory/export`
🔐 Download the full inventory as a CSV file.

**Same query params as above.**

**Response `200 OK`** — `Content-Type: text/csv`, `Content-Disposition: attachment; filename="full-inventory.csv"`

---

### GET `/api/reports/maintenance-summary`
🔐 Maintenance ticket summary list.

**Query params** — `startDate`, `endDate`

**Response `200 OK`** — array of maintenance items

---

### GET `/api/reports/maintenance-summary/export`
🔐 Download maintenance summary as CSV.

---

### GET `/api/reports/warranty-expiry`
🔐 Assets whose warranty expires within `days` days.

**Query params**

| Param | Type | Default |
|---|---|---|
| `days` | int | 30 |

**Response `200 OK`** — filtered inventory items

---

### GET `/api/reports/warranty-expiry/export`
🔐 Download warranty-expiry list as CSV.

---

### GET `/api/reports/audit-log`
🟦 Paginated audit log with optional filters. **Admin only.**

**Query params**

| Param | Type | Default |
|---|---|---|
| `actor` | string (partial match) | — |
| `startDate` | ISO date / datetime | — |
| `endDate` | ISO date / datetime | — |
| `page` | int | 0 |
| `size` | int | 20 |

**Response `200 OK`** — Spring `Page<AuditLogDTO>`
```json
{
  "content": [
    {
      "id":           42,
      "actor":        "jane@example.com",
      "action":       "Assigned",
      "resourceType": "Assignment",
      "resourceId":   "10",
      "details":      "Asset 'MacBook Pro 14\"' assigned to Jane Doe.",
      "createdAt":    "2025-04-01T10:31:05"
    }
  ],
  "totalElements": 1,
  "totalPages":    1
}
```

---

### GET `/api/reports/audit-log/export`
🟦 Download the audit log as CSV. Same query params as above. **Admin only.**

---

### POST `/api/reports/audit-log`
🔓 *(Internal — called by asset-service and maintenance-service AOP aspects via Feign)*  
Persist a new audit log entry.

**Request body**
```json
{
  "actor":        "jane@example.com",
  "action":       "Created",
  "details":      "Asset 'Dell XPS 15' (HARDWARE) at Floor 2 added to inventory.",
  "resourceType": "Asset",
  "resourceId":   "7"
}
```

**Response `200 OK`** — `AuditLogDTO` with `id` and `createdAt`

---

## 7. Notification Service

> Routed to `notification-service` on port **8086**

---

### GET `/api/notifications`
🔐 Retrieve all unread notifications for the authenticated user (identified via `X-User-Id` header forwarded by the gateway).

**Response `200 OK`**
```json
[
  {
    "id":          1,
    "recipientId": 3,
    "message":     "Asset MacBook Pro 14\" (ID 5) has been assigned to you.",
    "type":        "ASSET_ASSIGNED",
    "readStatus":  false,
    "createdAt":   "2025-04-01T10:31:06",
    "readAt":      null
  }
]
```

---

### PUT `/api/notifications/{id}/read`
🔐 Mark a specific notification as read.

**Response `200 OK`** — updated notification with `readStatus: true` and `readAt` timestamp

---

### POST `/api/notifications/internal/assignment`
🔓 *(Internal — called by asset-service when an asset is assigned or returned)*  
Create a notification for a user.

**Request body**
```json
{
  "recipientId": 3,
  "message":     "Asset MacBook Pro 14\" (ID 5) has been assigned to you.",
  "type":        "ASSET_ASSIGNED"
}
```

**Notification types dispatched by asset-service**

| Type | Trigger |
|---|---|
| `ASSET_ASSIGNED` | Asset assigned to employee |
| `ASSET_RETURNED` | Assignment marked as returned |

**Response `200 OK`** — `NotificationResponseDTO`

---

### POST `/api/notifications/internal/maintenance`
🔓 *(Internal — called by maintenance-service)*  
Create a notification for a user.

**Request body** — same shape as above

**Notification types dispatched by maintenance-service**

| Type | Trigger | Recipient |
|---|---|---|
| `MAINTENANCE_CREATED` | Ticket created | Employee (confirmation) |
| `MAINTENANCE_NEW_TICKET` | Ticket created | All active asset managers |
| `MAINTENANCE_STATUS_UPDATED` | Status changed | Employee who raised ticket |
| `MAINTENANCE_NOTE_ADDED` | Note appended | Employee who raised ticket |

**Response `200 OK`** — `NotificationResponseDTO`

---

## Error Responses

All services return a consistent error shape:

```json
{
  "timestamp": "2025-04-01T10:31:06",
  "status":    400,
  "message":   "Asset is not available for assignment. Current status: UNDER_MAINTENANCE",
  "path":      "/api/assignments"
}
```

| HTTP Status | Meaning |
|---|---|
| `400 Bad Request` | Validation error or invalid state transition |
| `401 Unauthorized` | Missing or expired JWT |
| `403 Forbidden` | Authenticated but insufficient role |
| `404 Not Found` | Resource does not exist |
| `409 Conflict` | Business rule violation (e.g. asset already assigned) |
| `500 Internal Server Error` | Unexpected server error |

---

## Internal-Only Endpoints (not routed through gateway)

These are called service-to-service via Feign over Eureka. They are **not accessible from the frontend**.

| Method | Path | Service | Called by |
|---|---|---|---|
| `GET` | `/api/internal/assets` | asset-service | report-service |
| `GET` | `/api/internal/assets/{id}` | asset-service | maintenance-service |
| `PUT` | `/api/internal/assets/{id}/status` | asset-service | maintenance-service |
| `GET` | `/api/internal/assignments/active` | asset-service | report-service |
| `GET` | `/api/internal/maintenances` | maintenance-service | report-service |
| `GET` | `/internal/auth/users` | auth-service | maintenance-service, user-service |
| `GET` | `/internal/auth/users/by-email` | auth-service | user-service |
| `PUT` | `/internal/auth/users/{email}/profile` | auth-service | user-service |
| `PUT` | `/internal/auth/users/{id}/role` | auth-service | user-service |
| `PUT` | `/internal/auth/users/{id}/status` | auth-service | user-service |
| `POST` | `/api/reports/audit-log` | report-service | asset-service AOP, maintenance-service AOP |
| `POST` | `/api/notifications/internal/assignment` | notification-service | asset-service |
| `POST` | `/api/notifications/internal/maintenance` | notification-service | maintenance-service |
