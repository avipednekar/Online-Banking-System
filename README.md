# Online Banking System

Spring Boot banking API with PostgreSQL-ready persistence, JWT authentication, ledger-style transaction recording, beneficiary management, audit logging, and a React frontend.

## Stack

- Java 17
- Spring Boot 3
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL
- React + Vite
- Ledger entries and audit logs

## Backend setup

Set these environment variables before running the backend:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/online_banking"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_password"
$env:JWT_SECRET="use-at-least-32-characters-for-your-jwt-secret"
$env:JWT_EXPIRATION_MS="86400000"
```

Run the backend from the project root:

```bash
mvn spring-boot:run
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
- `GET /api/accounts`
- `GET /api/accounts/{accountNumber}`
- `POST /api/accounts/{accountNumber}/deposit`
- `POST /api/accounts/{accountNumber}/withdraw`
- `POST /api/accounts/transfer`
- `GET /api/accounts/{accountNumber}/transactions`
- `POST /api/beneficiaries`
- `GET /api/beneficiaries`

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

Create an account with the returned token:

```json
POST /api/accounts
Authorization: Bearer <token>
{
  "accountType": "SAVINGS",
  "openingBalance": 1000.00
}
```

The backend generates account numbers automatically in a fixed pattern such as:

```text
9123400001
8456700001
```

Transfer funds:

```json
POST /api/accounts/transfer
Authorization: Bearer <token>
{
  "fromAccountNumber": "9123400001",
  "toAccountNumber": "8456700001",
  "amount": 250.00
}
```

## Verification

Backend tests:

```bash
mvn test
```

## Reset behavior

- The application is currently configured with `app.reset-user-data-on-startup=true` in [src/main/resources/application.properties](D:\Online Banking System\src\main\resources\application.properties), so customer users, accounts, beneficiaries, transactions, ledger entries, banks, and audit logs are wiped on startup while the admin user is preserved.
- After the clean restart you can set that flag to `false` if you no longer want every application start to clear the data.

Frontend production build:

```bash
cd frontend
npm run build
```

## Security implemented

- Passwords are hashed with BCrypt
- JWT protects all non-auth endpoints
- Frontend auth state is centralized in an auth context instead of scattered component state
- Frontend API calls are centralized in `api.js`
- Frontend defaults to same-origin `/api` instead of exposing a fixed backend host in bundled client code
- Frontend session data now uses `sessionStorage` instead of `localStorage`
- Account operations use the authenticated user instead of trusting a URL user ID
- Transfers to other users require an approved beneficiary
- Audit logs are written for registration, account creation, balance actions, and beneficiary creation
- Ledger entries are written for posted balance movements
- Global validation and exception handling return API-safe error responses
- CORS is limited to the React dev origin by default
- Admin-only endpoints are protected with role checks

## Security note

If a browser calls an API directly, some network path will always be visible in developer tools. To fully hide internal service topology, deploy the frontend behind a reverse proxy or backend-for-frontend and use same-origin routes such as `/api`. For stronger token security in production, move away from JavaScript-accessible storage to `HttpOnly`, `Secure`, `SameSite` cookies with backend session handling or refresh-token rotation.

## Domain improvements

- Customer profiles with KYC status
- Customer profile addresses normalized into a separate `customer_addresses` relation to keep customer attributes in 3NF
- Customer onboarding with name, address, gender, occupation, phone number, and date of birth
- Account status and currency code
- Backend-generated account numbers with a standard pattern
- Beneficiary registry per customer with bank names normalized into a canonical `banks` relation
- Transaction status, channel, and counterparty tracking
- Ledger entries for debit and credit history
- Audit logging for sensitive operations

## Data normalization

- `bank_users`, `customer_profiles`, `customer_addresses`, `accounts`, `transactions`, and `ledger_entries` are modeled in 3NF so non-key facts depend on the key for each relation.
- `banks` is treated as a BCNF-style reference relation with a canonical unique bank name reused by beneficiaries instead of storing repeated free-text bank names.
- Startup schema reconciliation backfills `customer_addresses` and `banks` from legacy inline columns so existing deployments can migrate without manual data repair.

## Additional security you should add next

- Refresh tokens with rotation and token revocation
- Email verification and password reset flows
- Rate limiting on login and transfer endpoints
- HTTPS only in deployment
- Strong secret management with environment or vault tooling
- Database migrations with Flyway or Liquibase
- Audit logging for login, transfer, and failed auth events
- Optional 2FA for high-risk actions
