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
SAV-00000001
CUR-00000001
```

Transfer funds:

```json
POST /api/accounts/transfer
Authorization: Bearer <token>
{
  "fromAccountNumber": "SAV-00000001",
  "toAccountNumber": "CUR-00000001",
  "amount": 250.00
}
```

## Verification

Backend tests:

```bash
mvn test
```

Frontend production build:

```bash
cd frontend
npm run build
```

## Security implemented

- Passwords are hashed with BCrypt
- JWT protects all non-auth endpoints
- Account operations use the authenticated user instead of trusting a URL user ID
- Transfers to other users require an approved beneficiary
- Audit logs are written for registration, account creation, balance actions, and beneficiary creation
- Ledger entries are written for posted balance movements
- Global validation and exception handling return API-safe error responses
- CORS is limited to the React dev origin by default

## Domain improvements

- Customer profiles with KYC status
- Customer onboarding with name, address, gender, occupation, phone number, and date of birth
- Account status and currency code
- Backend-generated account numbers with a standard pattern
- Beneficiary registry per customer
- Transaction status, channel, and counterparty tracking
- Ledger entries for debit and credit history
- Audit logging for sensitive operations

## Additional security you should add next

- Refresh tokens with rotation and token revocation
- Email verification and password reset flows
- Rate limiting on login and transfer endpoints
- HTTPS only in deployment
- Strong secret management with environment or vault tooling
- Database migrations with Flyway or Liquibase
- Audit logging for login, transfer, and failed auth events
- Optional 2FA for high-risk actions
