# Fastor CRM Backend

Implements the Fastor Node.js assessment (Assignments 1 & 2) with counselor authentication and lead-claim workflows.

## Requirement Mapping

| Requirement | Implementation |
| --- | --- |
| Node.js + Express REST API | `server.js`, `routes/` |
| Counselor register/login with JWT | `controllers/employeeController.js`, `middlewares/auth.js` |
| SQLite via Sequelize (Postgres-ready) | `config/database.js`, `models/` |
| Public enquiry submission (unauthenticated) | `controllers/enquiryController.js:5-32`, `routes/enquiryRoutes.js:12` |
| List unclaimed/claimed enquiries | `controllers/enquiryController.js:34-66` |
| Claim lead with conflict handling | `controllers/enquiryController.js:68-102` |

## Getting Started

```bash
npm install
cp .env.example .env
npm start
```

For development reloads: `npm run dev`.

## Testing

Run the Jest/Supertest suite against an isolated SQLite file:

```bash
npm test
```

## Render Deployment Checklist

1. **Environment variables**
   - Mandatory: `PORT`, `JWT_SECRET`, `JWT_TTL`, `BCRYPT_ROUNDS`
   - Managed DB (Render Postgres recommended):
     - `DB_DIALECT=postgres`
     - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT=5432`
     - `DB_SSL=true` (Render Postgres requires SSL)
   - Optional: `DB_LOGGING=true` for verbose ORM logs
2. **Build/Start command** – Render can run `npm install` (or `npm ci`) followed by `npm start`; no extra steps required.
3. **Database bootstrapping** – Sequelize `sync()` auto-creates tables on first run.
4. **Post-deploy smoke test** –
   - Register + log in a counselor
   - Submit a public enquiry (no auth)
   - Verify public list shows the lead
   - Claim the lead and confirm it moves to the private list
5. **Monitoring** – rely on Render logs; no additional services bundled.

## API Quick Reference

- `POST /api/employees/register`
- `POST /api/employees/login`
- `POST /api/enquiries/public`
- `GET /api/enquiries/public`
- `GET /api/enquiries/private`
- `PATCH /api/enquiries/:id/claim`

All protected routes expect `Authorization: Bearer <token>`.

## Configuration Notes

- `.env.example` documents every supported variable.
- `DB_SSL=true` enables TLS for hosted SQL providers.
- Tests use `crm_db.test.sqlite` so they do not interfere with development data.
