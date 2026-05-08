# Full System Integration & Testing Guide

This guide walks you through the entire process of running and testing the newly integrated Frontend and Backend microservices locally.

## 🚀 Running the System

You have two options to run the system: using Docker Compose (Recommended) or running it locally via your IDE.

### Option A: Using Docker Compose (Recommended)

Since the system is fully Dockerized with multi-stage builds and internal networks, this is the easiest way to spin everything up without worrying about order or local dependencies.

1. Ensure Docker Desktop is running.
2. Open your terminal at `D:\SE-2 Project\Assets-Tracking-System-SE2\Backend`.
3. Run the following command:
   ```bash
   docker-compose up --build -d
   ```
4. **Wait about 60-90 seconds.** The containers use `healthcheck` dependencies. The order of startup is:
   `PostgreSQL` -> `Config Server` -> `Eureka Server` -> `Auth/Asset/User/Maintenance Services` -> `API Gateway` -> `Frontend`.
5. Check the status using `docker-compose ps`. All containers should eventually say `(healthy)`.
6. Access the application at **http://localhost:3000**.

### Option B: Running Manually via IDE / Terminal

If you are actively developing and want to run it via IntelliJ, VS Code, or Maven, you **MUST** follow this exact startup order.

1. **Start the Database (PostgreSQL):**
   ```bash
   cd Backend
   docker-compose up postgres pgadmin -d
   ```
2. **Start the Infrastructure (Wait 10s between each):**
   - Run `ConfigServerApplication` (Port 8888)
   - Run `EurekaServerApplication` (Port 8761)
   - Run `ApiGatewayApplication` (Port 8080)
3. **Start the Microservices (Order does not matter here):**
   - Run `AuthServiceApplication` (Port 8081)
   - Run `AssetServiceApplication` (Port 8082)
   - Run `UserServiceApplication` (Port 8083)
   - Run `MaintenanceServiceApplication` (Port 8085)
4. **Start the Frontend:**
   ```bash
   cd ../Frontend
   npm install
   npm run dev
   ```
   Access the frontend at **http://localhost:3000**.

---

## 🧪 Testing the Flows

Here is the step-by-step guide to testing each core piece of the system.

### 1. Authentication & Registration (Auth Service)

- **Test:** Go to the Frontend Login page and click **Sign Up** (or use Postman `POST http://localhost:8080/api/auth/register`).
- **Data:** Register with an email (e.g., `admin@test.com`), password, and Role (`ROLE_ADMIN` or `ROLE_EMPLOYEE`).
- **Verify:** The frontend should successfully log you in and redirect you to the Dashboard. Your JWT is stored securely and all subsequent requests are attached with this token.

### 2. User Profile Management (User Service)

- **Test:** Navigate to your **Profile** page on the Frontend.
- **Action:** Update your full name.
- **Backend Flow:** This hits `PUT /api/users/profile` on the API Gateway -> Routes to User Service -> Checks your JWT -> Uses internal Feign client to update the actual database in Auth Service.
- **Verify:** The name updates without logging you out.
- **Admin Test:** Log in as `ROLE_ADMIN` and navigate to the "Manage Users" page. You should be able to see all registered users and toggle their roles or disable their accounts.

### 3. Asset Lifecycle (Asset Service)

- **Test:** Log in as `ROLE_ADMIN` or `ROLE_ASSET_MANAGER`.
- **Action:** Create a new Asset (e.g., "Dell XPS 15 Laptop", Category: "Electronics").
- **Verify:** Asset is saved with status `AVAILABLE`.
- **Assignment:** Assign the asset to an Employee ID.
- **Verify:** The Asset status automatically transitions to `ASSIGNED`.

### 4. Maintenance Ticketing (Maintenance Service)

- **Test:** Log in as an `EMPLOYEE` who owns the asset.
- **Action:** Create a Maintenance Ticket for the asset (e.g., "Screen is flickering").
- **Backend Flow:** The Maintenance Service accepts the ticket -> Uses Feign Client to talk to Asset Service -> Automatically marks the linked Asset as `UNDER_MAINTENANCE`.
- **Verify:** Check the Asset list. The laptop should now show as `UNDER_MAINTENANCE`.
- **Resolution:** Log in as Admin/Manager, mark the maintenance ticket as `RESOLVED`. The system will automatically bounce the linked Asset back to `AVAILABLE`.

### 5. API Gateway & Security Verification

- **CORS Testing:** The API Gateway is configured strictly to allow connections from `http://localhost:3000`. You can test this by trying to `fetch` the API from a different domain (like `http://google.com` console), it will be blocked.
- **Rate Limiting:** Try spamming the Login button 6 times in a row with the wrong password. The 6th attempt should block you with `HTTP 429 Too Many Requests`.

---

### Troubleshooting

- **Cannot connect to backend?** Check if you have multiple things running on Port 8080. If so, kill any background Java processes or conflicting containers.
- **Services failing to register?** Ensure Eureka (8761) is fully booted and says "Started EurekaServerApplication" before starting the others.
- **Database login fails?** Ensure the `DB_PASSWORD` in your `.env` or system matches `postgres` which we set in the config server.
