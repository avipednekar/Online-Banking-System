# Online Banking System

A full-stack, India-focused banking application. The project pairs a Spring Boot REST API with a React/Vite web client for customer banking and administration workflows.

## What it does

- Customer registration, login, refresh-token rotation, and logout
- JWT-protected customer and administrator workspaces
- KYC review before an account can be opened
- Savings and current accounts denominated in INR
- Deposits, withdrawals, account statements, and paginated transaction history
- Verified internal beneficiaries and idempotent transfers
- Administrative approval for transfers of INR 50,000 or more
- Double-sided posting records, transaction ledger entries, audit logs, and an outbox table
- Customer registry, KYC management, and pending-transfer queue for administrators

## Technology

| Area | Tools |
| --- | --- |
| Backend | Java 17, Spring Boot 3.5, Spring Web, Spring Security, Spring Data JPA |
| Database | PostgreSQL, Flyway, HikariCP |
| Authentication | JWT access tokens, HTTP-only refresh-token cookies, Argon2id password hashing with a server-side pepper |
| Frontend | React 18, React Router, Vite, Tailwind CSS, Lucide |
| Testing | JUnit 5, Spring Boot Test, MockMvc, H2 (test profile) |

## Project layout

```text
.
|- src/main/java/com/onlinebanking/   # API, domain model, security, and services
|- src/main/resources/
|  |- db/migration/                   # Flyway database migrations
|  |- application-local.properties    # Local PostgreSQL profile
|  `- application-prod.properties     # Production profile
|- src/test/                          # Backend integration tests
|- frontend/                          # React/Vite application
|- .env.example                       # Backend environment-variable template
`- README.md
```

## Prerequisites

- JDK 17+
- Maven 3.9+ (or an IDE with Maven support)
- Node.js 18+ and npm
- PostgreSQL 14+ for local or production runs

## Run locally

### 1. Configure PostgreSQL and backend secrets

Create a database named `online_banking`, then copy the backend template and supply strong development values:

```powershell
Copy-Item .env.example .env
```

Update `.env` with the database password and values for `JWT_SECRET`, `PASSWORD_PEPPER`, `ENCRYPTION_MASTER_KEY`, and `ADMIN_PASSWORD`. The local profile reads `DB_USERNAME` and `DB_PASSWORD` from this file; its database URL is `jdbc:postgresql://localhost:5432/online_banking`.

`ENCRYPTION_MASTER_KEY` must be a Base64-encoded 32-byte key. For example, PowerShell can generate one with:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 2. Start the backend

The `local` profile is active by default. It runs Flyway migrations and creates the configured administrator if one does not already exist.

```powershell
mvn spring-boot:run
```

The API is available at `http://localhost:8080`.

The default local administrator username is `admin`; its password is the `ADMIN_PASSWORD` configured in `.env`.

### 3. Start the frontend

The committed frontend environment template already uses the Vite proxy, so browser requests to `/api` are forwarded to the backend.

```powershell
Set-Location frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

## Configuration

### Backend profiles

| Profile | Purpose | Database configuration |
| --- | --- | --- |
| `local` (default) | Development | Local PostgreSQL database; CORS permits `http://localhost:5173`; refresh cookie is not marked `Secure` |
| `prod` | Deployment-like runtime | Requires `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, JWT/encryption secrets, and `ALLOWED_ORIGINS`; refresh cookie is `Secure` |
| `test` | Automated integration tests | In-memory H2 in PostgreSQL compatibility mode |

To use the production profile, set the required variables and run:

```powershell
$env:SPRING_PROFILES_ACTIVE = "prod"
$env:DB_URL = "jdbc:postgresql://localhost:5432/online_banking"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "replace-me"
$env:JWT_SECRET = "at-least-32-characters-of-random-secret-material"
$env:JWT_EXPIRATION_MS = "900000"
$env:JWT_REFRESH_EXPIRATION_MS = "604800000"
$env:PASSWORD_PEPPER = "replace-with-a-secret-pepper"
$env:ENCRYPTION_MASTER_KEY = "base64-encoded-32-byte-key"
$env:ALLOWED_ORIGINS = "https://your-frontend.example.com"
mvn spring-boot:run
```

Do not commit `.env` files or use the local bootstrap administrator credentials in a deployed environment.

### Frontend environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api` | API base path or a trusted absolute API URL |
| `API_PROXY_TARGET` | `http://localhost:8080` | Vite development proxy destination |
| `VITE_TRUSTED_API_ORIGINS` | empty | Comma-separated absolute API origins allowed by the client when not using same-origin requests |

For a separate frontend and API origin, add the frontend origin to backend `ALLOWED_ORIGINS` and the API origin to `VITE_TRUSTED_API_ORIGINS`. Credentials are required for the refresh-token cookie.

## Core workflow

1. A customer registers; the account starts with `PENDING` KYC status.
2. An administrator verifies KYC from the admin workspace or API.
3. The customer opens a `SAVINGS` or `CURRENT` account with an opening balance of at least INR 100.
4. The customer adds an active internal beneficiary, then creates a transfer with a unique `Idempotency-Key` header.
5. Transfers below INR 50,000 post immediately. Transfers at or above that value remain `PENDING_APPROVAL` until an administrator approves them.

Only Indian customer profiles and INR accounts are supported. Transfers maintain a minimum source-account balance of INR 100.

## API overview

All successful responses use this envelope:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Except for `/api/auth/**`, endpoints require an access token:

```http
Authorization: Bearer <access-token>
```

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create a customer and start a session |
| POST | `/api/auth/login` | Authenticate and start a session |
| POST | `/api/auth/refresh` | Rotate the refresh token and issue a new access token |
| POST | `/api/auth/logout` | Revoke the current refresh session |
| GET | `/api/auth/me` | Retrieve the current user profile |
| POST / GET | `/api/accounts` | Open an account / list the customer's accounts |
| GET | `/api/accounts/{accountNumber}` | Retrieve an owned account |
| POST | `/api/accounts/{accountNumber}/deposit` | Deposit funds |
| POST | `/api/accounts/{accountNumber}/withdraw` | Withdraw funds |
| GET | `/api/accounts/{accountNumber}/transactions?page=0&size=20` | Retrieve a paginated statement (`size` maximum: 100) |
| POST / GET | `/api/beneficiaries` | Create / list beneficiaries |
| GET | `/api/beneficiaries/lookup/{accountNumber}` | Verify an internal beneficiary account |
| POST | `/api/transfers` | Create an idempotent beneficiary transfer |
| GET | `/api/admin/overview` | View administrator metrics |
| GET | `/api/admin/customers` | List customers with optional `page`, `size`, `search`, and `kycStatus` filters |
| GET | `/api/admin/customers/{userId}` | View a customer record |
| PATCH | `/api/admin/customers/{userId}/kyc` | Update customer KYC status |
| GET | `/api/admin/transfers/pending` | List transfers awaiting approval |
| PATCH | `/api/admin/transfers/{transferId}/approve` | Post a pending transfer |

### Example: create a transfer

```http
POST /api/transfers
Authorization: Bearer <access-token>
Idempotency-Key: 3a2ed88d-3ed6-45c3-a22e-0c53ac44cf85
Content-Type: application/json

{
  "fromAccountId": "ACC-...",
  "beneficiaryId": "BEN-...",
  "amount": 250.00,
  "currency": "INR",
  "remarks": "Invoice payment",
  "channel": "ONLINE_BANKING"
}
```

Use a new idempotency key for a new intended transfer. Retrying the same request with the same key returns the existing transfer instead of charging the account twice.

## Security and data handling

- Access tokens are signed JWTs; refresh tokens are stored server-side as hashes and sent in HTTP-only cookies.
- Refreshing a session rotates its refresh token and invalidates the previous access token.
- Passwords use a peppered Argon2id encoder. Sensitive profile fields are encrypted at rest through a JPA converter, with lookup hashes where needed.
- Five failed login attempts temporarily lock the account (the default lock period is 15 minutes).
- Role-based access control limits `/api/admin/**` to administrators.
- Transfer posting uses ordered pessimistic balance locks and an idempotency key. Each posted transfer creates debit and credit transaction, ledger, and posting records.
- Flyway manages schema changes; JPA validates rather than generates the schema at runtime.

## Test and build

Run the backend integration suite:

```powershell
mvn test
```

Build the frontend production bundle:

```powershell
Set-Location frontend
npm run build
```

The frontend currently provides no separate test script. The backend test profile runs against H2 and covers authentication/session security, banking operations, transfers, and administrator workflows.

## Important notes

- This application is an educational/project implementation, not a substitute for a regulated banking platform.
- Deploy behind HTTPS and provide production-grade secret management, monitoring, rate limiting, backup/restore procedures, and a security review before handling real financial data.
