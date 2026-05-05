# Local Development Setup Guide

## For Each Team Member

Follow these steps when you pull the project for the first time:

### **Step 1: Copy the environment file**
```bash
# From the Backend directory, copy the example file
cp .env.example .env
```

### **Step 2: Update the `.env` file with your local password**

Edit `.env` and set values (for local development, you can use simple defaults):

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres          # Use this password locally
PGADMIN_EMAIL=admin@admin.com
PGADMIN_PASSWORD=admin
JWT_SECRET=your_super_secret_key_that_should_be_at_least_256_bits_long_for_HS256_algorithm_in_production_environment
```

### **Step 3: Ensure PostgreSQL is running locally**

Make sure you have PostgreSQL running on `localhost:5432` with:
- Username: `postgres`
- Password: `postgres` (or whatever you set in `.env`)
- Database: `assets_auth_db`, `assets_user_db`, `assets_asset_db`, `assets_report_db`, `assets_maintenance_db`

**Option A:** Use Docker to run PostgreSQL
```bash
docker run -d --name asset-tracking-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine
```

**Option B:** Install PostgreSQL locally on your machine

### **Step 4: Create required databases**

Connect to PostgreSQL and run:
```sql
CREATE DATABASE assets_auth_db;
CREATE DATABASE assets_user_db;
CREATE DATABASE assets_asset_db;
CREATE DATABASE assets_report_db;
CREATE DATABASE assets_maintenance_db;
```

Or use the provided `init-db.sql`:
```bash
psql -U postgres -h localhost < init-db.sql
```

### **Step 5: Run the services**

From the `Backend` directory:

```bash
# Terminal 1 - Config Server
cd config-server
mvn spring-boot:run

# Terminal 2 - Eureka Server  
cd eureka-server
mvn spring-boot:run

# Terminal 3 - Auth Service
cd auth-service
mvn spring-boot:run

# Terminal 4 - API Gateway
cd api-gateway
mvn spring-boot:run

# Terminal 5 - Report Service
cd report-service
mvn spring-boot:run

# Terminal 6 - Notification Service
cd notification-service
mvn spring-boot:run

# Add other services as needed
```

Or use VS Code's Run configurations to start them in the debugger.

### **Step 6: Run tests**

```bash
# Run all tests
mvn test

# Or run tests for a specific service
cd auth-service
mvn test
```

---

## **Important Security Notes**

- ⚠️ **NEVER commit `.env` file to GitHub** - it's in `.gitignore`
- The `.env.example` shows the template - team members copy and customize it
- Each developer has their own local `.env` with their local credentials
- When we deploy to production/Docker, we'll use proper secrets management

---

## **Troubleshooting**

**"password authentication failed"**
- Check your `.env` file has the correct `DB_PASSWORD`
- Verify PostgreSQL is running with the same password
- Make sure the config server is running (it reads the environment variables)

**Services can't connect to Config Server**
- Ensure Config Server is running on `http://localhost:8888`
- Check the firewall isn't blocking port 8888

**Can't find database**
- Verify all required databases are created
- Check PostgreSQL is listening on `localhost:5432`

