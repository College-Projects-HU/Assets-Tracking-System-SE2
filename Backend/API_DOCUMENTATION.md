# Asset Tracking System - Working APIs

## Base URL
```
http://localhost:8080/api
```

---

## Authentication Service (`/api/auth`)
**Base Port:** `8081` (via API Gateway on port `8080`)

### 1. **Register User**
- **Endpoint:** `POST /api/auth/register`
- **Description:** Create a new user account
- **Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "ADMIN" // or "USER", "MANAGER", etc.
}
```
- **Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400000
}
```
- **Validation Rules:**
  - `fullName`: 2-100 characters (required)
  - `email`: Valid email format (required)
  - `password`: 6-100 characters (required)
  - `role`: String (required)

---

### 2. **Login User**
- **Endpoint:** `POST /api/auth/login`
- **Description:** Authenticate user and get tokens
- **Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400000
}
```
- **Validation Rules:**
  - `email`: Valid email format (required)
  - `password`: 6-100 characters (required)

---

### 3. **Refresh Access Token**
- **Endpoint:** `POST /api/auth/refresh`
- **Description:** Get a new access token using refresh token
- **Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400000
}
```

---

### 4. **Logout User**
- **Endpoint:** `POST /api/auth/logout`
- **Description:** Blacklist the current token (invalidate JWT)
- **Headers:** 
```
Authorization: Bearer <access_token>
```
- **Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```
- **Authentication:** ✅ Required (JWT Bearer token)

---

## Report Service (`/api/reports`)
**Base Port:** `8084` (via API Gateway on port `8080`)

All report endpoints require a valid JWT. The audit-log endpoints also require the `ADMIN` role.

### Dashboard KPIs

- `GET /api/reports/dashboard-stats` - Combined payload for the dashboard.
- `GET /api/reports/full-inventory` - Full asset inventory with optional filters: `startDate`, `endDate`, `category`, `status`.
- `GET /api/reports/maintenance-summary` - Maintenance summary with optional `startDate` and `endDate` filters.
- `GET /api/reports/warranty-expiry?days=N` - Assets with warranties expiring within `N` days.

### CSV Export

- `GET /api/reports/full-inventory/export`
- `GET /api/reports/maintenance-summary/export`
- `GET /api/reports/warranty-expiry/export?days=N`
- `GET /api/reports/audit-log/export`

### Audit Log

- `GET /api/reports/audit-log` - Paginated, filterable by `startDate`, `endDate`, and `actor`.
- Query params: `page` (default `0`), `size` (default `20`).

### Example Dashboard Response

```json
{
  "assetSummary": [
    {
      "category": "Laptop",
      "statusCounts": {
        "ACTIVE": 10,
        "RETIRED": 2
      }
    }
  ],
  "activeAssignments": [
    {
      "id": 1,
      "assetId": 100,
      "assigneeId": 7,
      "assigneeName": "Jane Doe",
      "status": "ACTIVE"
    }
  ],
  "maintenanceCosts": {
    "totalCost": 1500.0,
    "byCategory": {
      "Laptop": 1200.0,
      "Chair": 300.0
    }
  }
}
```

---

## Notification Service (`/api/notifications`)
**Base Port:** `8086` (via API Gateway on port `8080`)

The notification service is a lightweight microservice for unread/read management.

### Public User APIs

- `POST /api/notifications` - Create a notification.
- `GET /api/notifications` - Fetch unread notifications for the current user. Requires `X-User-Id` header.
- `PUT /api/notifications/{id}/read` - Mark a notification as read. Requires `X-User-Id` header.

### Internal Triggers

- `POST /api/notifications/internal/assignment`
- `POST /api/notifications/internal/maintenance`

### Example Create Request

```json
{
  "recipientId": 7,
  "message": "Assignment created",
  "type": "ASSIGNMENT"
}
```

### Example Response

```json
{
  "id": 1,
  "recipientId": 7,
  "message": "Assignment created",
  "type": "ASSIGNMENT",
  "readStatus": false,
  "createdAt": "2026-05-04T22:00:00",
  "readAt": null
}
```

---

## Frontend Integration Example

### Using the API (TypeScript/React)

```typescript
const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Register
const register = async (fullName, email, password, role) => {
  const response = await api.post("/auth/register", {
    fullName,
    email,
    password,
    role,
  });
  localStorage.setItem("accessToken", response.data.accessToken);
  localStorage.setItem("refreshToken", response.data.refreshToken);
  return response.data;
};

// Login
const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  localStorage.setItem("accessToken", response.data.accessToken);
  localStorage.setItem("refreshToken", response.data.refreshToken);
  return response.data;
};

// Refresh Token
const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  const response = await api.post("/auth/refresh", { refreshToken });
  localStorage.setItem("accessToken", response.data.accessToken);
  return response.data;
};

// Logout
const logout = async () => {
  await api.post("/auth/logout");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};
```

---

## Other Services (Coming Soon)

The following services are scaffolded but **not yet implemented**:

- **Asset Service** (Port: `8082`) - CRUD for assets
- **User Service** (Port: `8083`) - User management
- **Report Service** (Port: `8084`) - Dashboard, standard reports, CSV export, audit log
- **Maintenance Service** (Port: `8085`) - Maintenance tracking
- **Notification Service** (Port: `8086`) - Notifications and read/unread management

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200 OK` - Success
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Invalid/missing token
- `500 Internal Server Error` - Server error

---

## Notes for Frontend Team

1. **Token Storage:** Use `localStorage` for JWT tokens (accessToken, refreshToken)
2. **Token Expiration:** Access token expires in 24 hours (86400000 ms)
3. **Auto-refresh:** Implement interceptor to auto-refresh token before expiry
4. **CORS:** API Gateway handles CORS, you can call from frontend on `http://localhost:3000` (or your dev port)
5. **Gateway:** All requests should go through API Gateway (`http://localhost:8080/api`), not individual services

