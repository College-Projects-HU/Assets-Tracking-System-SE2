# edits.txt Implementation Checklist

Date: 2026-05-09
Status labels: `DONE`, `PARTIAL`, `NOT DONE`

1. Login invalid data error flashes and page refresh; add loading.
- Status: `PARTIAL`
- Notes: Loading was added and error handling improved in login form. A major forced-refresh cause (hard redirect on API 401) was fixed in `Frontend/src/services/api.ts`. Full end-to-end verification in browser still needed.

2. Admin deactivates user and cannot reactivate.
- Status: `DONE`
- Notes: Backend activate endpoint added (`PUT /users/{id}/activate`) and frontend activation wired.

3. Admin can change user roles from list.
- Status: `DONE`
- Notes: Role `Select` is present in staff management and persisted via apply flow.

4. Apply-changes button for user management changes; batch apply revoke/delete; confirmations/loading for critical actions across system.
- Status: `PARTIAL`
- Notes: Staff page batches role/status changes; confirmations/loading now added in assets delete, maintenance status updates, assignment create/revoke, and approval approve/reject. Still not fully unified across every destructive action in the app.

5. Create asset: if status is `ASSIGNED`, must choose assigned user.
- Status: `DONE`
- Notes: Assignment selection UI is present and validation now enforces assigned user when status is ASSIGNED.

6. Add loading effects where needed.
- Status: `PARTIAL`
- Notes: Added in login, staff, assets, maintenance, assignments, and approvals for key actions. Some secondary flows still need polishing for full consistency.

7. Improve input validation for login/registration and necessary parts.
- Status: `PARTIAL`
- Notes: Login/register and staff-create have stronger validation; asset form validation improved. Other forms still need consistency pass.

8. Asset-manager registration requires admin approval; add admin-only approval page + sidebar.
- Status: `DONE`
- Notes: Registration now creates disabled asset manager accounts; admin-only approvals page and sidebar route added.

9. Bulk asset import (xlsx/csv) on frontend with validation.
- Status: `PARTIAL`
- Notes: Frontend import now validates extension (`.csv`/`.xlsx`) and max size (10MB) before upload, plus backend-error handling. Schema/content-row validation is still limited.

10. Audit logs: admin-only access; export CSV in frontend.
- Status: `DONE`
- Notes: Audit route/sidebar restricted to admin and CSV export exists.

11. Notifications for maintenance tickets and assignments; define recipients/actions.
- Status: `PARTIAL`
- Notes: Backend notification triggers added for assignment events (assigned/returned) and maintenance events (ticket created/status updated). Frontend notifications API mapping fixed to existing backend endpoints. Remaining: broader notification scenarios and UX polishing.

12. Remove/fix asset cost attribute mismatch with DB.
- Status: `PARTIAL`
- Notes: Asset form and backend mapping no longer rely on purchase cost; frontend `Asset` model now makes it optional. Legacy mock data still includes cost values and report-side maintenance cost remains separate by design.

13. Fix dashboard/stat cards to be dynamic from stored data.
- Status: `DONE`
- Notes: Dashboard and reports now compute card values dynamically from fetched backend data for both manager and employee role paths.

14. Assets delete bug + URL/port odd behavior after refresh; explain why.
- Status: `PARTIAL`
- Notes: Added delete confirmation/loading and removed hard redirect-on-401 flow causing hard reload side-effects. Need browser reproduction to confirm full resolution in all flows.

15. Admin should not create tickets; can resolve manager tickets.
- Status: `PARTIAL`
- Notes: Backend now enforces employee-only ticket creation and removed admin from maintenance update/note/upcoming endpoints. Frontend also treats maintenance handling as asset-manager flow. Confirm final business rule on whether admin should resolve tickets or be fully excluded (currently excluded).

16. Profile page available to all users; editable basic info.
- Status: `DONE`
- Notes: Settings/Profile route now allows all roles and supports name update.

17. Asset managers should see all employees/assets/tickets; multiple managers same privileges.
- Status: `PARTIAL`
- Notes: Asset-service controller updated for managers to see all assets, and manager role access widened in frontend. Full tickets/employees backend checks still needed.

18. Ticket process: employee creates, asset manager handles, admin only sees history in audit log.
- Status: `PARTIAL`
- Notes: Backend now enforces employee creates + manager/technician handle; admin removed from ticket endpoints. Frontend loads employee tickets from `/maintenance/my` and manager handles status transitions. End-to-end validation in running environment still needed.

19. Provide importable Postman collection.
- Status: `DONE`
- Notes: `ATS_Postman_Collection.json` added.
