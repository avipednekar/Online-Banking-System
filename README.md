# Online Banking System

Spring Boot banking API with PostgreSQL-ready persistence, JWT authentication, ledger-style transaction recording, beneficiary management, audit logging, and a React frontend.

## Stack

- Java 17
- Spring Boot 3
- Spring Security with JWT
- Spring Data JPA (Hibernate with statement caching & batching)
- PostgreSQL (Tuned for high concurrency)
- HikariCP Connection Pool
- Flyway Database Migrations
- React + Vite
- Ledger entries and audit logs

## Backend setup

For local development, the backend now defaults to the `local` profile and can start without extra environment variables:

```bash
mvn spring-boot:run
```

If your shell or IDE previously set `SPRING_PROFILES_ACTIVE=prod`, either clear it or force the local profile explicitly:

```powershell
Remove-Item Env:SPRING_PROFILES_ACTIVE -ErrorAction SilentlyContinue
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The local profile uses in-memory H2, local-only JWT/encryption secrets, and bootstraps an admin user:

```text
username: admin
password: Admin@123
```

For production-style runs, activate the `prod` profile and set these environment variables first:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/online_banking"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_password"
$env:JWT_SECRET="use-at-least-32-characters-for-your-jwt-secret"
$env:JWT_EXPIRATION_MS="900000"
$env:JWT_REFRESH_EXPIRATION_MS="604800000"
$env:PASSWORD_PEPPER="server-side-password-pepper"
$env:ENCRYPTION_MASTER_KEY="<base64-encoded-32-byte-key>"
$env:ALLOWED_ORIGINS="https://your-frontend.example.com"
```

Run the production-style backend from the project root:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

Backend base URL:

```text
http://localhost:8080
```

## Frontend setup

Create a frontend env file from [frontend/.env.example](D:\Online Banking System\frontend\.env.example):

```powershell
Copy-Item frontend\.env.example frontend\.env
```

The frontend now defaults to same-origin `/api` requests. In local development, Vite proxies `/api` to the backend target from `API_PROXY_TARGET`, so the browser does not need a hardcoded `http://localhost:8080` API host.

Refresh sessions are now cookie-backed. Keep `VITE_API_BASE_URL=/api` unless you also explicitly allow a trusted API origin through `VITE_TRUSTED_API_ORIGINS` and the backend `ALLOWED_ORIGINS` setting.

Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend base URL:

```text
http://localhost:5173
```

## Frontend architecture

- `frontend/src/api/api.js`: centralized API client and error parsing
- `frontend/src/context/AuthContext.jsx`: session and authentication state
- `frontend/src/components/auth`: onboarding and login UI
- `frontend/src/components/customer`: customer banking dashboard
- `frontend/src/components/admin`: admin KYC and customer management dashboard
- `frontend/src/hooks/useNotifications.js`: notification state
- `frontend/src/utils`: shared formatters

## Main API endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/accounts`
- `GET /api/accounts/requests`
- `GET /api/accounts`
- `GET /api/accounts/{accountNumber}`
- `POST /api/accounts/{accountNumber}/deposit`
- `POST /api/accounts/{accountNumber}/withdraw`
- `POST /api/accounts/transfer`
- `GET /api/accounts/{accountNumber}/transactions`
- `POST /api/beneficiaries`
- `GET /api/beneficiaries`
- `GET /api/admin/account-requests`
- `PATCH /api/admin/account-requests/{requestId}/approve`

## Example API flow

Register:

```json
POST /api/auth/register
{
  "fullName": "Alice Johnson",
  "username": "alice",
  "email": "alice@example.com",
  "password": "Password@123",
  "phoneNumber": "9876543210",
  "gender": "FEMALE",
  "occupation": "Software Engineer",
  "addressLine1": "12 Park Street",
  "addressLine2": "Flat 5B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postalCode": "400001",
  "country": "India",
  "dateOfBirth": "1997-08-10"
}
```

Example auth response:

```json
{
  "userId": 1,
  "username": "alice",
  "role": "USER",
  "token": "jwt-token-here",
  "expiresIn": 86400000,
  "message": "User registered successfully"
}
```

Submit an account opening request after KYC verification:

```json
POST /api/accounts
Authorization: Bearer <token>
{
  "accountType": "SAVINGS",
  "openingBalance": 1000.00
}
```

The request remains pending until an admin approves it. Only after approval does the backend generate the account number in a fixed pattern such as:

```text
9123400001
8456700001
```

Approve the request as admin:

```text
PATCH /api/admin/account-requests/{requestId}/approve
```

Transfer funds after approval:

```json
POST /api/accounts/transfer
Authorization: Bearer <token>
{
  "fromAccountNumber": "9123400001",
  "toAccountNumber": "8456700001",
  "amount": 250.00
}
```

## Advanced Transfer Architecture

- **Idempotency Execution**: Secure transfers via `POST /api/transfers` using client-supplied `Idempotency-Key` headers securely tracking against the unique `transfer_records` table to guarantee repeat networking faults never double bill an account.
- **Pessimistic Ledger Locking**: High volume concurrency is protected via strict, alphabetized `findByAccountIdsForUpdate` pessimistic locks directly on isolated `AccountBalance` records.
- **Optimistic Hot-Fix Bypassing**: To prevent generic `StaleObjectStateException` heaps under maximum multi-thread loads, the denormalized presentation `Account.balance` safely skips standard JPA `@Version` collisions via dedicated `@Modifying` queries.

## Load Testing framework

The backend's concurrency protections are verified via raw K6 javascript load tests available in the `load-tests` directory.
Using `papaparse` to iterate mock users dynamically, you can simulate massive, perfectly parallel account requests and transfers. 

To execute the test pipelines locally:

1. Request bulk account openings asynchronously:
```bash
k6 run .\load-tests\bulk-account-open.js
```
2. Fast-Forward Auto-Approval map generation:
```bash
node .\load-tests\generate-testing-data.js
```
3. Test 100% Concurrent Stress Transfers:
```bash
k6 run .\load-tests\simultaneous-transfers.js
```

## Security implemented

- Passwords are hashed with BCrypt
- JWT protects all non-auth endpoints
- Frontend auth state is centralized in an auth context instead of scattered component state
- Frontend API calls are centralized in `api.js`
- Frontend session data now uses `sessionStorage` instead of `localStorage`
- Account operations use the authenticated user instead of trusting a URL user ID
- Transfers to other users require an approved beneficiary
- Transfers enforce strict local-region geographical locks via Customer Profile constraints
- Audit logs are written for registration, account creation, balance actions, and beneficiary creation
- Ledger entries are written for posted balance movements
- Global validation and exception handling return API-safe error responses gracefully

## Data normalization & Database optimization

- `bank_users`, `customer_profiles`, `customer_addresses`, `accounts`, `transactions`, `beneficiaries`, `ledger_entries`, and `account_number_sequences` are modeled in BCNF.
- **Server Tuning**: `postgresql.conf` configured for customized memory limits (`shared_buffers`, `effective_cache_size`, `work_mem`) and SSD-aware query planner costs.
- **Targeted Indexes**: Functional indexes (e.g. `LOWER(username)`) and join coverage added via Flyway migrations based on `EXPLAIN ANALYZE` results.
- **Connection Pooling**: HikariCP configured with leak detection, prepared statement caching, and optimized lifetime maximums.
- **Pagination**: All unbounded collections are paginated natively through the database using Spring Data `Pageable` and returned with a standard `PagedResponse<T>`.
- **JPA Batching**: Hibernate configured to batch DML operations (`order_inserts`, `order_updates`) for ledger and audit tables.

## Additional improvements to pursue

- Refresh tokens with rotation and token revocation
- Email verification and password reset flows
- Rate limiting on login and transfer endpoints
- HTTPS only in deployment
- Optional 2FA for high-risk actions
