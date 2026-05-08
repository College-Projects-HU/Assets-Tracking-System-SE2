# Frontend Integration & Testing Guide

This guide covers the fully integrated React frontend with the Spring Boot backend services.

## 🛠️ Frontend Setup

### Prerequisites
- Node.js 18+ installed
- Backend services running (see main TESTING_GUIDE.md for backend setup)

### Quick Start

1. **Install Dependencies:**
   ```bash
   cd "d:\SE-2 Project\Assets-Tracking-System-SE2\Frontend"
   npm install --legacy-peer-deps
   ```

2. **Start Dev Server:**
   ```bash
   npm run dev
   ```
   Frontend will be available at **http://localhost:5173**

3. **Build for Production:**
   ```bash
   npm run build
   ```
   Output in `Frontend/dist/` folder, served by Docker Nginx on port 3000.

---

## 📱 Frontend Architecture & Integration Points

### Service Layer (`Frontend/src/services/`)
All API calls go through these service wrappers:

| Service | Purpose | Backend Endpoints |
|---------|---------|-------------------|
| `authService` | Login/Register/Token validation | `POST /auth/login`, `POST /auth/register`, `GET /auth/validate` |
| `assetService` | Asset CRUD, filtering, assignment | `GET/POST /assets`, `PUT /assets/:id`, `DELETE /assets/:id` |
| `userService` | User profile, staff management | `GET/PUT /users`, `GET /users/:id` |
| `maintenanceService` | Maintenance tickets | `GET/POST /maintenance/tickets`, `PUT /maintenance/tickets/:id` |
| `reportService` | Dashboard stats, audit logs, reports | `GET /reports/dashboard`, `GET /reports/audit-log` |
| `notificationService` | Push notifications | `GET /notifications`, `POST /notifications/:id/read` |

All services use a shared Axios instance (`Frontend/src/services/api.ts`) configured with:
- **Base URL:** `http://localhost:8080/api` (configurable via `VITE_API_BASE_URL` env var)
- **JWT Auth:** Automatically attached to all requests from auth store
- **Error Handling:** 401 redirects to login; other errors logged to console

---

## 🧪 End-to-End Testing Flows

### Test 1: Authentication Flow
**Objective:** Test login/register and JWT persistence

1. Navigate to **http://localhost:5173**
2. Click "Sign Up" and register:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Role: `EMPLOYEE`
3. **Expected:** Redirected to Dashboard, user info displayed in sidebar
4. **Verify:** Open DevTools → LocalStorage → find `ats_user` (contains JWT)
5. **Refresh Page:** Should stay logged in (JWT persisted in localStorage)
6. **Test Demo Accounts:** If backend auth service not ready, fallback to demo credentials:
   - Admin: `admin@ats.com / admin`
   - Manager: `manager@ats.com / manager`
   - Employee: `employee@ats.com / employee`

---

### Test 2: Asset Management (Manager/Admin Only)
**Objective:** Test full CRUD on assets

1. Log in as **Admin** or **Asset Manager**
2. Navigate to **Assets** page
3. **Create Asset:**
   - Click "Add Asset" button
   - Fill form: Name=`MacBook Pro`, Category=`HARDWARE`, Brand=`Apple`, etc.
   - Click "Save Asset"
   - **Expected:** Asset appears in table, backend returns HTTP 201
4. **Read Assets:**
   - All assets load from backend `GET /assets`
   - **Verify:** Table shows real assets, not mock data
   - **Filter:** Use Status/Category dropdowns
   - **Search:** Type asset name; filters in real-time (client-side)
5. **Update Asset:**
   - Click Edit icon on any asset
   - Modify name and save
   - **Expected:** Calls `PUT /assets/:id`, asset updates in table
6. **Delete Asset:**
   - Click Delete icon
   - **Expected:** Calls `DELETE /assets/:id`, asset removed from table

**API Calls to Verify (DevTools → Network tab):**
- `POST http://localhost:8080/api/assets` (create)
- `GET http://localhost:8080/api/assets` (read all)
- `PUT http://localhost:8080/api/assets/:id` (update)
- `DELETE http://localhost:8080/api/assets/:id` (delete)

---

### Test 3: User Profile & Staff Management
**Objective:** Test profile updates and user list synchronization

1. **Profile Update:**
   - Click **Settings** in sidebar
   - Update your name and save
   - **Expected:** Calls `PUT /api/users/:id`, JWT-protected, name updates in sidebar after refresh
2. **Staff Management (Admin Only):**
   - Navigate to **Staff** page
   - **Expected:** Loads list from `GET /api/users` (backend pulls from User Service)
   - Click "Add User" and create new staff member
   - **Expected:** New user appears in list (if backend supports create endpoint)

**API Calls to Verify:**
- `PUT http://localhost:8080/api/users/:id` (profile update)
- `GET http://localhost:8080/api/users` (staff list)

---

### Test 4: Maintenance Ticketing
**Objective:** Test maintenance request creation and status tracking

1. Log in as **Employee**
2. Navigate to **Maintenance** page
3. **Create Ticket:**
   - Select an asset you're assigned to
   - Fill issue description: `Screen flickering`
   - Select priority: `HIGH`
   - Click "Create Ticket"
   - **Expected:** Ticket saved, list refreshes
4. **Track Ticket:**
   - As Admin/Manager, navigate to **Maintenance**
   - See all open tickets
   - Click on a ticket and update status to `IN_PROGRESS` or `RESOLVED`
   - **Expected:** Backend updates ticket status and possibly links to Asset Service

**API Calls to Verify:**
- `POST http://localhost:8080/api/maintenance/tickets` (create)
- `GET http://localhost:8080/api/maintenance/tickets` (list all)
- `PUT http://localhost:8080/api/maintenance/tickets/:id` (update status)

---

### Test 5: Dashboard & Reports (Real-Time Data)
**Objective:** Verify dashboard loads live data, not mocks

1. Log in as **Admin/Manager**
2. Navigate to **Dashboard**
   - **Expected:** Stats load from `GET /api/reports/dashboard`
   - Cards show: Total Assets, Assigned, Available, Under Maintenance, Open Tickets
   - Recent assets and maintenance tickets load from backend
3. Navigate to **Reports & Analytics**
   - **Expected:** All tabs (Asset Inventory, Maintenance Summary, Warranty Expiry) populate from backend
   - CSV export buttons work (either via backend `GET /assets/export` or client-side generation from fetched data)
4. As **Employee:** Dashboard shows only:
   - My Assigned Assets (filtered by `assignedToId`)
   - My Open Tickets
   - Relevant activity

**API Calls to Verify:**
- `GET http://localhost:8080/api/reports/dashboard` (stats)
- `GET http://localhost:8080/api/assets` (asset list for reports)
- `GET http://localhost:8080/api/maintenance/tickets` (maintenance for reports)
- `GET http://localhost:8080/api/reports/audit-log` (activity history)

---

### Test 6: Notifications (Polling)
**Objective:** Test real-time notification polling

1. While logged in, open DevTools → Network tab
2. Look for repeated requests to `GET http://localhost:8080/api/notifications`
   - **Expected:** Calls happen every 10 seconds
3. Check the notification bell icon in sidebar
   - Shows unread notification count as badge
   - Dropdown displays recent notifications
4. Click "Mark Read" or "Mark All" to acknowledge notifications
   - **Expected:** Calls `POST /notifications/:id/read` or `POST /notifications/read-all`

**Polling Configuration:**
- Interval: 10 seconds (configurable in `Frontend/src/hooks/useNotifications.ts`)
- Auto-fetches on mount, cleans up on unmount
- Gracefully handles backend unavailability

---

## 🐳 Docker Build & Deployment

### Build Frontend for Docker
```bash
npm run build
```

### Update Backend Docker Compose
The frontend Dockerfile is already in place. To rebuild:

```bash
cd Backend
docker-compose build frontend
docker-compose up -d frontend
```

Frontend will be served on **http://localhost:3000** via Nginx.

---

## 🔍 Debugging Tips

1. **Check Console Errors:**
   - DevTools → Console tab
   - Look for failed API calls or type errors
   - Common: `Unexpected token < in JSON` = backend returning HTML error page

2. **Inspect Network Requests:**
   - DevTools → Network tab
   - Filter by XHR to see API calls
   - Check request headers for `Authorization: Bearer <JWT>`
   - Check response status: 200 (OK), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)

3. **Check LocalStorage:**
   - DevTools → Application → LocalStorage → `http://localhost:5173`
   - Look for `ats_user` key (contains JWT and user info)

4. **Backend Logs:**
   - Monitor service logs: `docker-compose logs -f <service-name>`
   - Example: `docker-compose logs -f user-service`
   - Look for exceptions or connection refused errors

5. **API Base URL Config:**
   - If frontend can't find backend, check env var `VITE_API_BASE_URL`
   - Default: `http://localhost:8080/api`
   - Override in `.env.local` or Docker build

---

## ✅ Integration Checklist

- [ ] Authentication: Login, register, JWT stored and sent with each request
- [ ] Assets: Create, read, update, delete via backend API
- [ ] Users: Profile update, staff list load from backend
- [ ] Maintenance: Create tickets, track status via backend
- [ ] Dashboard: Stats and recent activity load from backend, not mocks
- [ ] Reports: All export and filtering use backend data
- [ ] Notifications: Polling works, bell icon updates
- [ ] Error Handling: 401 redirects to login, error messages display
- [ ] Role-Based UI: Menus and buttons respect user role
- [ ] Performance: No unnecessary re-renders or API calls

---

## 📝 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| CORS Error | Frontend on 5173, backend on 8080 | Ensure API Gateway has CORS enabled for `http://localhost:5173` |
| 401 Unauthorized | JWT missing or expired | Clear localStorage, login again |
| API not found (404) | Wrong endpoint path | Check backend route definitions |
| Network timeout | Backend not running | Start backend services, check `docker-compose ps` |
| Blank page | JS error in console | Check browser console for errors |
| Assets stay empty | Backend returns 500 | Check `asset-service` logs: `docker-compose logs asset-service` |

