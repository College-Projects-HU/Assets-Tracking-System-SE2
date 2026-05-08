# Assets Tracking System - Fixes Implementation Summary

## Overview
This document details all the fixes implemented to resolve the three major issues reported in the system.

---

## Issue 1: Asset Isolation Problem ✅ FIXED

### Problem
When multiple asset managers create accounts and create assets, all asset managers see the same assets. Each asset manager should only see their own assets.

### Root Cause
The Asset entity didn't track which manager created it, so there was no way to filter assets per manager.

### Solution Implemented

#### Backend Changes:

1. **Asset Entity** - Added `createdByUserId` field
   - File: `Backend/asset-service/src/main/java/com/assets/assetservice/entity/Asset.java`
   - Added: `private Long createdByUserId;` field with `@Column(name = "created_by_user_id")`

2. **AssetService Interface** - Updated method signatures
   - File: `Backend/asset-service/src/main/java/com/assets/assetservice/service/AssetService.java`
   - Updated `createAsset()` to accept `userId` and `userRole` parameters
   - Updated `getAllAssets()` to accept `userId` and `userRole` parameters for filtering

3. **AssetServiceImpl** - Implemented asset isolation logic
   - File: `Backend/asset-service/src/main/java/com/assets/assetservice/service/impl/AssetServiceImpl.java`
   - `createAsset()`: Now captures and sets `createdByUserId` from the request header
   - `getAllAssets()`: Filters assets by `createdByUserId` when user is `ASSET_MANAGER` (but not `ADMIN`)
   - ADMIN users can still see all assets

4. **AssetController** - Added header extraction
   - File: `Backend/asset-service/src/main/java/com/assets/assetservice/controller/AssetController.java`
   - Updated endpoints to extract `X-User-Id` and `X-User-Role` headers from requests
   - Passes these to service methods for proper user identification and filtering

#### How It Works:
1. When an ASSET_MANAGER creates an asset, their user ID is captured and stored in `createdByUserId`
2. When fetching assets, ASSET_MANAGER users only see assets where `createdByUserId == their userId`
3. ADMIN users see all assets (no filtering applied)
4. Each asset manager now has complete data isolation

---

## Issue 2: Assignment Form Data Not Loading ✅ FIXED

### Problem
When trying to assign assets to employees, the dropdown doesn't show:
- Available assets the manager has
- Employees logged into the site
- Backend data is not being fetched

### Root Cause
1. Users endpoint required ADMIN role, preventing ASSET_MANAGER from fetching employee list
2. Frontend API service wasn't sending user context headers needed by backend

### Solution Implemented

#### Backend Changes:

1. **UserController** - Updated permissions
   - File: `Backend/user-service/src/main/java/com/assets/userservice/controller/UserController.java`
   - Changed `@PreAuthorize("hasRole('ADMIN')")` to `@PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")`
   - Now ASSET_MANAGER can retrieve the list of all employees

#### Frontend Changes:

1. **API Service** - Added user context headers
   - File: `Frontend/src/services/api.ts`
   - Updated request interceptor to include:
     - `X-User-Id`: User's ID for backend to identify requester
     - `X-User-Role`: User's role for authorization checks
   - These headers enable backend to properly filter data per user

#### How It Works:
1. Frontend API interceptor automatically adds user headers to all requests
2. ASSET_MANAGER can now fetch employee list via `/api/users` endpoint
3. Backend filters assets by `createdByUserId` using the `X-User-Id` header
4. Assignment form now has complete data for both assets and employees

---

## Issue 3: Maintenance Ticket Submission Not Working ✅ FIXED

### Problem
Submit button on maintenance ticket form does nothing after:
- Selecting an asset
- Writing issue description
- Choosing priority
- Clicking submit

### Root Cause
1. Missing validation of required fields
2. Improper error handling and user feedback
3. No error display in UI
4. Asset ID type mismatch in form

### Solution Implemented

#### Frontend Changes:

1. **MaintenancePage** - Enhanced error handling
   - File: `Frontend/src/pages/MaintenancePage.tsx`
   - Updated imports to include Alert components for error display
   - Enhanced `handleCreate()` function with:
     - Field validation checks
     - Proper type conversion for assetId
     - Detailed error messages
     - Error state clearing on success
   
2. **MaintenancePage** - Added UI feedback
   - Added error alert display at top of page
   - Added loading state display
   - Proper error messages passed to user
   - Success state clears the error message

#### Improvements:
```javascript
// Before: Would silently fail
const handleCreate = () => {
  const asset = assets.find(a => a.id === Number(form.assetId));
  if (!asset || !user) return; // Silent failure
  // ...
};

// After: Validates and provides feedback
const handleCreate = () => {
  // Validate all required fields
  if (!form.assetId || !form.issueDescription.trim() || !form.priority) {
    setError('Please fill all required fields');
    return;
  }
  
  const asset = assets.find(a => String(a.id) === form.assetId);
  if (!asset || !user) {
    setError('Invalid asset or user not found');
    return;
  }
  
  // Make API call with proper error handling
  maintenanceService.create({...}).then(...).catch(err => {
    setError(`Failed to create ticket: ${err.response?.data?.message || err.message}`);
  });
};
```

#### How It Works:
1. User fills in all required fields (Asset, Description, Priority)
2. Clicking Submit triggers validation
3. If validation passes, API call is made with `X-User-Id` and `X-User-Role` headers
4. Success: Ticket is created, form clears, page updates
5. Error: User sees detailed error message in alert box at top

---

## Additional Questions Answered

### Q1: How to Login as Admin?

**Admin Credentials:**
- **Email**: `admin@assets.com`
- **Password**: `Admin@123`

**Location**: Database initialization creates this user automatically on first startup
- File: `Backend/auth-service/src/main/java/com/assets/authservice/config/DataInitializer.java`
- Admin user is created if it doesn't exist when the auth service starts

### Q2: Where is AOP Used in the Project?

**AOP Implementation**: Aspect-Oriented Programming is used for **Method-Level Logging**

**Locations**:
1. **Auth Service**: `Backend/auth-service/src/main/java/com/assets/authservice/aspect/LoggingAspect.java`
2. **Asset Service**: `Backend/asset-service/src/main/java/com/assets/assetservice/aspect/LoggingAspect.java`
3. **Maintenance Service**: `Backend/maintenance-service/src/main/java/com/assets/maintenanceservice/aspect/LoggingAspect.java`

**What It Does**:
- Uses `@Aspect` annotation to create a cross-cutting concern
- Intercepts all controller and service method calls
- Logs method entry with parameters
- Logs method exit with return value and execution time
- Logs exceptions with detailed error information
- Pointcuts defined for:
  - All methods in `controller.*` packages
  - All methods in `service.*` packages

**Sample Log Output**:
```
[AssetController.createAsset] START | params: [AssetRequestDTO(...), userId, userRole]
[AssetServiceImpl.createAsset] START | params: [AssetRequestDTO(...), userId, userRole]
[AssetServiceImpl.createAsset] END | returned: AssetDTO(...) | duration: 45ms
[AssetController.createAsset] END | returned: ResponseEntity(...) | duration: 52ms
```

### Q3: Where Does the Database Store Data in Docker?

**Database Configuration**:

1. **Container**: `asset-tracking-db`
   - Image: `postgres:15-alpine`
   - Port: `5432`

2. **Storage Location**:
   - Inside Container: `/var/lib/postgresql/data`
   - Host Volume Mount: `pgdata:/var/lib/postgresql/data` (named Docker volume)
   - The actual files are stored in Docker's volumes directory

3. **Multiple Databases**:
   The system uses 5 separate PostgreSQL databases:
   - `assets_auth_db` - Authentication and user data
   - `assets_asset_db` - Asset inventory data
   - `assets_user_db` - User profile data
   - `assets_report_db` - Report data
   - `assets_maintenance_db` - Maintenance ticket data

4. **Initialization**:
   - File: `Backend/init-db.sql` - Creates all databases on container startup
   - Mounted at: `/docker-entrypoint-initdb.d/init-db.sql`

5. **Persistence**:
   - Data persists even after container stops/restarts
   - Docker volume `pgdata` is named and managed by Docker
   - To access data: Use pgAdmin at `http://localhost:5050`
     - Email: `admin@admin.com` (configurable via `PGADMIN_EMAIL`)
     - Password: `admin` (configurable via `PGADMIN_PASSWORD`)

6. **View Location**:
   ```bash
   # On Windows with Docker Desktop:
   docker volume inspect pgdata
   
   # Shows something like:
   # C:\ProgramData\Docker\volumes\pgdata\_data
   ```

---

## Testing the Fixes

### Test Asset Isolation:
1. Login as Asset Manager 1, create Asset A
2. Login as Asset Manager 2, create Asset B
3. Asset Manager 1 should only see Asset A
4. Asset Manager 2 should only see Asset B
5. Admin should see both assets A and B

### Test Assignment Form:
1. Login as Asset Manager
2. Go to Asset Assignments page
3. Click "New Assignment"
4. Verify assets dropdown shows only YOUR assets
5. Verify employees dropdown shows all employees
6. Select asset and employee, click "Confirm Assignment"
7. Assignment should complete successfully

### Test Maintenance Ticket:
1. Login as Employee or Asset Manager
2. Go to Maintenance page
3. Click "New Ticket"
4. Select an asset, write description, choose priority
5. Click "Submit Ticket"
6. Should see success (ticket created)
7. If error, should see error message displayed

---

## Files Modified

### Backend:
- `asset-service/src/main/java/com/assets/assetservice/entity/Asset.java`
- `asset-service/src/main/java/com/assets/assetservice/service/AssetService.java`
- `asset-service/src/main/java/com/assets/assetservice/service/impl/AssetServiceImpl.java`
- `asset-service/src/main/java/com/assets/assetservice/controller/AssetController.java`
- `user-service/src/main/java/com/assets/userservice/controller/UserController.java`

### Frontend:
- `src/services/api.ts`
- `src/pages/MaintenancePage.tsx`

---

## Database Migration Note

**Important**: The database schema has been updated with a new column `created_by_user_id` in the `assets` table.

**Migration required** (if using existing database):
```sql
ALTER TABLE assets ADD COLUMN created_by_user_id BIGINT;
```

However, if running from scratch with Docker, the new column will be created automatically during the next build.

---

## System is Now Ready! 🎉

All three issues have been resolved:
✅ Asset data is now isolated per asset manager
✅ Assignment form now properly loads assets and employees
✅ Maintenance ticket submission is functional with proper error handling

The system now properly implements:
- User-based data isolation
- Complete request/response error handling
- User context propagation through the system
