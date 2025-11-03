## Project Overview

Built a REST API that handles counselor authentication and enquiry management with a "claim" system for leads. The key challenge was implementing the claim/unclaim logic while preventing race conditions.

**Core Requirements Met:**
- Node.js + Express REST API with proper error handling
- JWT-based authentication for counselor accounts
- SQLite database with Sequelize ORM
- Public enquiry submission (no authentication required)
- Claim/unclaimed/private enquiry APIs with proper authorization

## Tech Stack

- **Node.js + Express** - REST API framework
- **SQLite + Sequelize** - Database layer (chose SQLite for simplicity in a demo project)
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Jest + Supertest** - Testing framework

## Getting Started

Install dependencies:
```bash
npm install
```

Copy environment template:
```bash
cp .env.example .env
```

Run the server:
```bash
npm start
```

Development mode with auto-reload:
```bash
npm run dev
```

## Testing

Comprehensive test suite covering core flows:
```bash
npm test
```

Tests run against an isolated database (`crm_db.test.sqlite`) to avoid interfering with development data.

## API Reference

**Authentication Routes:**
- `POST /api/employees/register` - Create counselor account
- `POST /api/employees/login` - Authenticate and receive JWT

**Enquiry Routes:**
- `POST /api/enquiries/public` - Submit public enquiry (no auth)
- `GET /api/enquiries/public` - List unclaimed enquiries (JWT required)
- `GET /api/enquiries/private` - List enquiries claimed by current counselor
- `PATCH /api/enquiries/:id/claim` - Claim an enquiry for logged-in counselor

All authenticated routes require `Authorization: Bearer <token>` header.

## Implementation Notes

**Database Design:**
- Used Sequelize transactions to handle concurrent claim operations
- Added proper indexes on frequently queried fields (status, claimedBy)
- Separate test database prevents data contamination during testing

**Security Considerations:**
- Passwords hashed with bcrypt (configurable rounds in .env)
- JWT tokens with configurable TTL
- Input validation on all endpoints
- Proper error handling with consistent response format

**Configuration Options:**
- `DB_LOGGING=true` - Enable verbose Sequelize logging
- `JWT_SECRET` - Token signing secret
- `JWT_EXPIRES_IN` - Token expiration time
- `BCRYPT_ROUNDS` - Password hashing complexity

**Known Limitations:**
- SQLite concurrency handling (see transaction implementation in enquiryController.js)
- No rate limiting implemented (would add for production)
- Basic error messages (could be more user-friendly)

## Code Structure

```
├── config/          # Database configuration
├── controllers/     # Business logic (auth, enquiries)
├── middlewares/     # JWT validation
├── models/         # Sequelize models
├── routes/         # API route definitions
├── tests/          # Jest test suites
└── server.js       # Application entry point
```

The enquiry claim logic uses database transactions to prevent race conditions where multiple counselors might claim the same enquiry simultaneously.
