# Registration Form — Project Context

## What This Project Is

A web-based registration form built as an evaluation task for a client. It collects user information, handles a dependent country-city dropdown, supports photo upload, validates all inputs, and saves everything to a database. On successful submission the user sees a "Thank You" confirmation page.

## Tech Stack

| Layer        | Technology                           | Why                                               |
|--------------|--------------------------------------|---------------------------------------------------|
| Frontend     | Next.js 14, TypeScript, Tailwind CSS | Already in CV; handles UI + API routes in one repo |
| Database     | Neon Serverless Postgres (free tier) | Already used in past projects; zero-config free   |
| ORM          | Drizzle ORM                          | Lightweight, TypeScript-native, works with Neon   |
| File Storage | Cloudinary (free tier)               | Persistent image hosting; returns a URL to store in DB |
| Deployment   | Vercel (free tier)                   | Single deployment for both frontend and API routes |

## Architecture Decision

This is a **Next.js full-stack** project — no separate backend server. Everything lives in one repo:

- `/app` — Next.js pages and UI
- `/app/api` — API routes that handle form submission and file upload
- `/db` — Drizzle schema and database client

This keeps deployment simple (one Vercel project) and meets the 1-2 day deadline.

## Form Fields

| Field         | Type                              | Required    |
|---------------|-----------------------------------|-------------|
| Full Name     | Text input                        | Yes         |
| Email Address | Email input                       | Yes         |
| Mobile Number | Tel input                         | Yes         |
| Date of Birth | Date picker                       | Yes         |
| Gender        | Radio buttons (Male/Female/Other) | Yes         |
| Interests     | Checkboxes (multi-select)         | Yes (min 1) |
| Country       | Dropdown                          | Yes         |
| City          | Dropdown (depends on Country)     | Yes         |
| Photo         | File upload (image only)          | Yes         |

## Dependent Dropdown Logic

City options change based on selected Country. Data is hardcoded on the frontend (no API call needed):

```
UAE      → Dubai, Sharjah, Abu Dhabi
India    → Mumbai, Delhi, Bangalore
Pakistan → Karachi, Lahore, Islamabad
USA      → New York, Los Angeles, Chicago
UK       → London, Manchester, Birmingham
```

More countries can be added in `/lib/countries.ts`.

## File Upload Rules

- Allowed types: `jpg`, `jpeg`, `png` only
- Max size: 1 MB
- Validated on both client (before submit) and server (in API route)
- File is uploaded to Cloudinary; the returned URL is stored in the database

## Database Schema

Table: `registrations`

| Column        | Type      | Notes                       |
|---------------|-----------|-----------------------------|
| id            | serial PK | Auto-increment              |
| full_name     | varchar   |                             |
| email         | varchar   | Unique                      |
| mobile        | varchar   |                             |
| date_of_birth | date      |                             |
| gender        | varchar   | male / female / other       |
| interests     | text[]    | Array of selected interests |
| country       | varchar   |                             |
| city          | varchar   |                             |
| photo_url     | varchar   | Cloudinary URL              |
| created_at    | timestamp | Default: now()              |

## Validation Rules

| Field         | Rule                                       |
|---------------|--------------------------------------------|
| Full Name     | Required, min 2 chars                      |
| Email         | Required, valid email format               |
| Mobile        | Required, 10-15 digits only               |
| Date of Birth | Required, must be a past date              |
| Gender        | Required, one of: male / female / other    |
| Interests     | Required, at least one selected            |
| Country       | Required                                   |
| City          | Required, must match selected country      |
| Photo         | Required, jpg/jpeg/png only, max 1 MB      |

Client-side validation uses **react-hook-form + zod**. Server-side validation re-checks everything in the API route before writing to the database.

## API Routes

| Method | Path             | Purpose                                                                          |
|--------|------------------|----------------------------------------------------------------------------------|
| POST   | `/api/register`  | Validates form data, uploads photo to Cloudinary, saves record to Neon Postgres  |

## Pages

| Route        | Purpose                                       |
|--------------|-----------------------------------------------|
| `/`          | Registration form                             |
| `/thank-you` | Success confirmation page shown after submit  |

## Deployment

- **Platform**: Vercel (free tier)
- **Database**: Neon Serverless Postgres (free tier) — connection string stored as `DATABASE_URL` env var
- **File Storage**: Cloudinary — credentials stored as `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` env vars

## Environment Variables

```env
DATABASE_URL=            # Neon Postgres connection string
CLOUDINARY_CLOUD_NAME=   # Cloudinary cloud name
CLOUDINARY_API_KEY=      # Cloudinary API key
CLOUDINARY_API_SECRET=   # Cloudinary API secret
```

## Spec-Driven Development

This project follows spec-driven development. All specs live in `/specs` and must be written and reviewed before any code is written.

| Spec File                  | Purpose                                              | Status  |
|----------------------------|------------------------------------------------------|---------|
| `specs/requirements.md`    | User stories and acceptance criteria                 | Pending |
| `specs/ui.md`              | Form fields, states, copy, responsive layout         | Pending |
| `specs/validation.md`      | Every validation rule with exact error messages      | Pending |
| `specs/api.md`             | API contract — request, response, error codes        | Pending |
| `specs/database.md`        | Schema, constraints, Drizzle ORM definitions, queries | Pending |

## Project Checklist

- [ ] Write `specs/requirements.md`
- [ ] Write `specs/ui.md`
- [ ] Write `specs/validation.md`
- [ ] Write `specs/api.md`
- [ ] Write `specs/database.md`
- [ ] Project scaffolding (Next.js + TypeScript + Tailwind)
- [ ] Drizzle ORM setup + Neon Postgres connection
- [ ] Database schema + migration
- [ ] Country-City data file (`/lib/countries.ts`)
- [ ] Zod validation schema (`/lib/validations.ts`)
- [ ] Registration form UI
- [ ] react-hook-form integration
- [ ] Cloudinary upload logic
- [ ] `/api/register` route
- [ ] Thank You page
- [ ] Deploy to Vercel

## Developer

**Syeda Urooj Fatima** — AI Engineer & Full-Stack Developer
GitHub: github.com/codewithurooj
