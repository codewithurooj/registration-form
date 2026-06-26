# Feature Specification: Database Schema — Registration Form

**Feature Branch**: `005-database-spec`
**Created**: 2026-06-25
**Status**: Draft
**Input**: Database specification for the registration form — Neon Serverless Postgres with Drizzle ORM

---

## Overview

This specification defines the data persistence layer for the registration form application. The database stores all form submissions from users who register through the web form. Each submission contains personal information, preferences, location data, and a reference to the user's uploaded photo.

**Why Neon Serverless Postgres**: Neon provides a serverless Postgres instance on the free tier with zero infrastructure management, HTTP-based connection pooling optimized for serverless environments (Vercel API routes), and no cold-start connection overhead that afflicts traditional Postgres in serverless deployments.

**ORM Approach**: Drizzle ORM provides TypeScript-native schema definitions, type-safe query building, and a lightweight migration runner (drizzle-kit) without the overhead of Prisma or TypeORM.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Submit Registration and Persist Data (Priority: P1)

A user fills out and submits the registration form. The system must durably store all submitted fields (including the Cloudinary photo URL) and confirm success. If the same email is re-submitted, the system must reject the duplicate without overwriting existing data.

**Why this priority**: Without persistent storage, zero registrations are captured. This is the sole reason the database exists.

**Independent Test**: Insert a registration record directly into the database and confirm all fields are stored with correct types, constraints are enforced, and the row is retrievable.

**Acceptance Scenarios**:

1. **Given** a valid registration payload, **When** the API inserts the record, **Then** a row exists in `registrations` with every field matching the submitted values and `created_at` set to the current timestamp.
2. **Given** an email that already exists in `registrations`, **When** a second insert with the same email is attempted, **Then** the insert fails with a unique constraint violation and no duplicate row is created.
3. **Given** a row missing a required field (e.g., `full_name`), **When** an insert is attempted, **Then** the database rejects it with a NOT NULL constraint violation.

---

### User Story 2 — Prevent Duplicate Registrations (Priority: P2)

Before inserting a new record, the system checks whether the submitted email already exists. This prevents the same person from registering twice and gives a meaningful error instead of a raw DB exception.

**Why this priority**: Email uniqueness is enforced at the DB level as a safety net even if the API route validates first. Both layers must agree.

**Independent Test**: Query the database for a specific email and confirm the lookup returns correctly (found / not found).

**Acceptance Scenarios**:

1. **Given** email `test@example.com` does not exist, **When** the existence check runs, **Then** it returns false and insertion proceeds.
2. **Given** email `test@example.com` already exists, **When** the existence check runs, **Then** it returns true and the API returns a duplicate-email error without inserting.

---

### Edge Cases

- What happens when the database is temporarily unavailable? The API route returns a 503 and the user sees a server error message.
- What happens if the Cloudinary upload succeeds but the DB insert fails? The photo URL is orphaned on Cloudinary — acceptable for MVP; the user retries the form.
- What happens if `interests` array is empty? The column is NOT NULL but allows an empty array — application-level validation requires at least one item before the insert is made.
- What happens if `date_of_birth` is a future date? The CHECK constraint `date_of_birth < CURRENT_DATE` rejects it at the DB level.
- What happens if `gender` is not one of the three allowed values? The CHECK constraint rejects the insert.
- What happens if `mobile` contains letters or special characters? The CHECK constraint (regex) rejects the insert.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST store one row per registration submission in a `registrations` table.
- **FR-002**: The system MUST enforce that `email` is unique across all rows — no two registrations may share an email address.
- **FR-003**: The system MUST reject any row where `gender` is not one of: `male`, `female`, `other`.
- **FR-004**: The system MUST reject any row where `date_of_birth` is not a past date.
- **FR-005**: The system MUST reject any row where `mobile` contains non-digit characters or is outside 10–15 digits in length.
- **FR-006**: The system MUST reject any row where `full_name` is shorter than 2 characters.
- **FR-007**: The system MUST store `interests` as a multi-value field (array of strings).
- **FR-008**: The system MUST record `created_at` automatically on insert — the caller must not supply this value.
- **FR-009**: The system MUST support duplicate-email detection as a separate query before insert.
- **FR-010**: The system MUST store only a URL reference to the uploaded photo, not binary image data.
- **FR-011**: The database MUST be reachable from a serverless environment without managing persistent TCP connections.
- **FR-012**: Schema changes MUST be applied via versioned, sequential migration files — never by editing the production schema directly.

### Key Entities

- **Registration**: A single form submission. Represents one person's registration attempt. Contains all personal details, preferences, location, and a link to their uploaded photo. Standalone table — no foreign keys or relationships to other tables in this MVP.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid form submissions result in a persisted row with all fields intact — zero silent data loss.
- **SC-002**: Duplicate email submissions are rejected in under 100ms with no data written.
- **SC-003**: All data integrity constraints (uniqueness, gender enum, past-date DOB, mobile format) are enforced at the storage level independent of application logic.
- **SC-004**: The initial schema migration applies to a fresh database in under 30 seconds.
- **SC-005**: Future schema changes can be applied without manual SQL edits on the production database.

### Assumptions

- Countries and cities are hardcoded in the frontend (`/lib/countries.ts`) — no lookup tables are stored in the database.
- No admin interface or reporting queries are required for MVP — only insert and email-existence-check operations are needed.
- No soft-delete or archival is needed — rows are permanent once inserted.
- Photo binary data is never stored in the database; only the Cloudinary URL is persisted.
- No row-level security or multi-tenant isolation is required — this is a single-tenant public form.

---

## Technical Database Specification

### 1. Table Specification — `registrations`

| Column | Postgres Type | Nullable | Default | Unique | Check Constraint | Drizzle Definition |
|--------|---------------|----------|---------|--------|------------------|--------------------|
| `id` | `serial` | NOT NULL | auto-increment | — | — | `serial('id').primaryKey()` |
| `full_name` | `varchar(255)` | NOT NULL | — | — | `LENGTH(full_name) >= 2` | `varchar('full_name', { length: 255 }).notNull()` |
| `email` | `varchar(255)` | NOT NULL | — | UNIQUE | — | `varchar('email', { length: 255 }).notNull().unique()` |
| `mobile` | `varchar(20)` | NOT NULL | — | — | `mobile ~ '^[0-9]{10,15}$'` | `varchar('mobile', { length: 20 }).notNull()` |
| `date_of_birth` | `date` | NOT NULL | — | — | `date_of_birth < CURRENT_DATE` | `date('date_of_birth').notNull()` |
| `gender` | `varchar(10)` | NOT NULL | — | — | `gender IN ('male','female','other')` | `varchar('gender', { length: 10 }).notNull()` |
| `interests` | `text[]` | NOT NULL | — | — | — | `text('interests').array().notNull()` |
| `country` | `varchar(100)` | NOT NULL | — | — | — | `varchar('country', { length: 100 }).notNull()` |
| `city` | `varchar(100)` | NOT NULL | — | — | — | `varchar('city', { length: 100 }).notNull()` |
| `photo_url` | `varchar(500)` | NOT NULL | — | — | — | `varchar('photo_url', { length: 500 }).notNull()` |
| `created_at` | `timestamp` | NOT NULL | `now()` | — | — | `timestamp('created_at').defaultNow().notNull()` |

---

### 2. Complete CREATE TABLE SQL

```sql
CREATE TABLE registrations (
  id            SERIAL        PRIMARY KEY,
  full_name     VARCHAR(255)  NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  mobile        VARCHAR(20)   NOT NULL,
  date_of_birth DATE          NOT NULL,
  gender        VARCHAR(10)   NOT NULL,
  interests     TEXT[]        NOT NULL,
  country       VARCHAR(100)  NOT NULL,
  city          VARCHAR(100)  NOT NULL,
  photo_url     VARCHAR(500)  NOT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),

  CONSTRAINT registrations_email_key         UNIQUE  (email),
  CONSTRAINT registrations_full_name_length  CHECK   (LENGTH(full_name) >= 2),
  CONSTRAINT registrations_mobile_format     CHECK   (mobile ~ '^[0-9]{10,15}$'),
  CONSTRAINT registrations_dob_past          CHECK   (date_of_birth < CURRENT_DATE),
  CONSTRAINT registrations_gender_enum       CHECK   (gender IN ('male', 'female', 'other'))
);

CREATE UNIQUE INDEX registrations_email_idx      ON registrations (email);
CREATE        INDEX registrations_created_at_idx ON registrations (created_at DESC);
```

---

### 3. Drizzle ORM Schema File

```typescript
// db/schema.ts
import { pgTable, serial, varchar, date, text, timestamp } from 'drizzle-orm/pg-core';

export const registrations = pgTable('registrations', {
  id:           serial('id').primaryKey(),
  fullName:     varchar('full_name',     { length: 255 }).notNull(),
  email:        varchar('email',         { length: 255 }).notNull().unique(),
  mobile:       varchar('mobile',        { length: 20  }).notNull(),
  dateOfBirth:  date('date_of_birth').notNull(),
  gender:       varchar('gender',        { length: 10  }).notNull(),
  interests:    text('interests').array().notNull(),
  country:      varchar('country',       { length: 100 }).notNull(),
  city:         varchar('city',          { length: 100 }).notNull(),
  photoUrl:     varchar('photo_url',     { length: 500 }).notNull(),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
});

export type InsertRegistration = typeof registrations.$inferInsert;
export type SelectRegistration = typeof registrations.$inferSelect;
```

> **Note on CHECK constraints**: Drizzle's `pgTable` does not support a built-in CHECK constraint DSL in stable releases. The CHECK constraints listed in Section 2 must be added manually in the migration SQL file — they will not be auto-generated from the schema above. Drizzle-kit will not drop them on subsequent migrations as long as they are not reflected in the schema object.

---

### 4. Indexes

| Index Name | Column(s) | Type | Reason |
|-----------|-----------|------|--------|
| `registrations_pkey` | `id` | UNIQUE btree (auto) | Primary key — row lookup by ID |
| `registrations_email_idx` | `email` | UNIQUE btree | Enforces uniqueness; O(log n) duplicate-email check before insert |
| `registrations_created_at_idx` | `created_at DESC` | btree | Supports listing registrations in reverse chronological order if an admin view is added later |

No indexes on `country`, `city`, `gender` — no MVP query pattern filters by these fields.

---

### 5. Constraints Summary

| Constraint Name | Type | Column | Rule |
|----------------|------|--------|------|
| `registrations_pkey` | PRIMARY KEY | `id` | Auto-enforced by `SERIAL PRIMARY KEY` |
| `registrations_email_key` | UNIQUE | `email` | One row per email address |
| `registrations_full_name_length` | CHECK | `full_name` | `LENGTH(full_name) >= 2` |
| `registrations_mobile_format` | CHECK | `mobile` | `mobile ~ '^[0-9]{10,15}$'` — digits only, 10–15 chars |
| `registrations_dob_past` | CHECK | `date_of_birth` | `date_of_birth < CURRENT_DATE` |
| `registrations_gender_enum` | CHECK | `gender` | `gender IN ('male', 'female', 'other')` |
| NOT NULL (all columns) | NOT NULL | all | Every column is required — no partial submissions |

---

### 6. Migration Strategy

#### drizzle-kit Configuration

```typescript
// drizzle.config.ts  (project root)
import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

#### Commands

```bash
# Generate migration SQL from schema diff
npx drizzle-kit generate

# Apply all pending migrations to the database
npx drizzle-kit migrate

# Inspect the current database schema (useful for debugging)
npx drizzle-kit introspect
```

#### What the Initial Migration File Looks Like

```sql
-- db/migrations/0000_initial_schema.sql
CREATE TABLE "registrations" (
  "id"            serial        PRIMARY KEY NOT NULL,
  "full_name"     varchar(255)  NOT NULL,
  "email"         varchar(255)  NOT NULL,
  "mobile"        varchar(20)   NOT NULL,
  "date_of_birth" date          NOT NULL,
  "gender"        varchar(10)   NOT NULL,
  "interests"     text[]        NOT NULL,
  "country"       varchar(100)  NOT NULL,
  "city"          varchar(100)  NOT NULL,
  "photo_url"     varchar(500)  NOT NULL,
  "created_at"    timestamp     DEFAULT now() NOT NULL
);

ALTER TABLE "registrations"
  ADD CONSTRAINT "registrations_email_key"        UNIQUE  ("email"),
  ADD CONSTRAINT "registrations_full_name_length"  CHECK   (LENGTH("full_name") >= 2),
  ADD CONSTRAINT "registrations_mobile_format"     CHECK   ("mobile" ~ '^[0-9]{10,15}$'),
  ADD CONSTRAINT "registrations_dob_past"          CHECK   ("date_of_birth" < CURRENT_DATE),
  ADD CONSTRAINT "registrations_gender_enum"       CHECK   ("gender" IN ('male', 'female', 'other'));

CREATE INDEX "registrations_created_at_idx" ON "registrations" ("created_at" DESC);
```

#### Handling Future Schema Changes

1. Edit `db/schema.ts` with the new column, renamed field, or removed constraint.
2. Run `npx drizzle-kit generate` — drizzle-kit diffs the current schema against the last migration and generates a new numbered file (e.g., `0001_add_notes_column.sql`).
3. Review the generated SQL before applying.
4. Run `npx drizzle-kit migrate` to apply.

**Rules**:
- Never edit an existing migration file.
- Never run raw `ALTER TABLE` against production — always go through drizzle-kit.
- Migration files are committed to git alongside schema changes.

---

### 7. Seed Data

**No seed data is required.**

- Country and city options are hardcoded in `/lib/countries.ts` on the frontend and are not stored in the database.
- There are no lookup tables, role tables, or reference data tables in this schema.
- The `registrations` table starts empty and is populated exclusively by real form submissions.

---

### 8. Queries — Drizzle ORM

#### 8.1 Drizzle Client Setup

```typescript
// db/client.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

#### 8.2 Insert a New Registration

```typescript
// db/queries.ts
import { db } from './client';
import { registrations } from './schema';
import type { InsertRegistration } from './schema';

export async function insertRegistration(data: InsertRegistration) {
  const [row] = await db
    .insert(registrations)
    .values(data)
    .returning({ id: registrations.id });
  return row; // { id: number }
}
```

**Example call:**

```typescript
await insertRegistration({
  fullName:    'Syeda Urooj',
  email:       'urooj@example.com',
  mobile:      '03001234567',
  dateOfBirth: '1995-04-15',
  gender:      'female',
  interests:   ['technology', 'design'],
  country:     'Pakistan',
  city:        'Karachi',
  photoUrl:    'https://res.cloudinary.com/demo/image/upload/v1/photo.jpg',
});
```

#### 8.3 Check if Email Already Exists

```typescript
import { eq } from 'drizzle-orm';
import { db } from './client';
import { registrations } from './schema';

export async function emailExists(email: string): Promise<boolean> {
  const result = await db
    .select({ id: registrations.id })
    .from(registrations)
    .where(eq(registrations.email, email))
    .limit(1);
  return result.length > 0;
}
```

#### 8.4 TypeScript Types (Inferred — No Manual Definitions Needed)

```typescript
import type { InsertRegistration, SelectRegistration } from '@/db/schema';

// InsertRegistration — shape of data passed to insert()
// id and createdAt are optional (DB-generated)
type InsertRegistration = {
  fullName: string;
  email: string;
  mobile: string;
  dateOfBirth: string;
  gender: string;
  interests: string[];
  country: string;
  city: string;
  photoUrl: string;
  id?: number;
  createdAt?: Date;
};

// SelectRegistration — shape returned by select queries (all fields present)
type SelectRegistration = {
  id: number;
  fullName: string;
  email: string;
  mobile: string;
  dateOfBirth: string;
  gender: string;
  interests: string[];
  country: string;
  city: string;
  photoUrl: string;
  createdAt: Date;
};
```

---

### 9. Neon Setup Steps

**Step 1 — Create a Neon Project**

1. Go to [neon.tech](https://neon.tech) and sign up or log in.
2. Click **New Project**.
3. Name it `registration-form`, select the nearest region (e.g., `AWS us-east-1`), Postgres 16.
4. Click **Create Project**.

**Step 2 — Get the Connection String**

1. In the Neon dashboard, go to **Connection Details**.
2. Select **Pooled connection** (required for serverless — uses Neon's PgBouncer proxy).
3. Copy the connection string:
   ```
   postgresql://user:password@ep-xxxx-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

**Step 3 — Set DATABASE_URL**

Local development — create `.env.local` at project root:
```env
DATABASE_URL=postgresql://user:password@ep-xxxx-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

Vercel production:
```
Project Settings → Environment Variables → Add DATABASE_URL (Production + Preview)
```

**Step 4 — Drizzle Client Connection**

Use the `@neondatabase/serverless` HTTP driver (see Section 8.1). This sends queries over HTTPS — no persistent TCP socket required.

**Connection Pooling Considerations**

| Driver | Use Case | Notes |
|--------|----------|-------|
| `neon()` HTTP driver | Next.js API routes, Edge Functions | No pool needed — one HTTPS request per query |
| `Pool` (WebSocket) from `@neondatabase/serverless` | Transactions spanning multiple queries | Required if using `db.transaction()` |
| `pg` (node-postgres) | Do NOT use in serverless | Opens TCP per invocation; exhausts Neon free-tier connection limit (10 max) |

For this MVP (single INSERT per request, no transactions), the HTTP driver is sufficient.

---

### 10. Data Retention & Privacy Notes

**Personal Data Stored**

| Field | Classification | Notes |
|-------|----------------|-------|
| `full_name` | PII | Full legal name |
| `email` | PII | Unique identifier and contact address |
| `mobile` | PII | Phone number |
| `date_of_birth` | Sensitive PII | Exact birthdate |
| `photo_url` | PII reference | Links to user photo hosted on Cloudinary |
| `gender` | Sensitive attribute | Self-identified |
| `interests` | Preference data | Non-sensitive |
| `country`, `city` | Location data | General location only — no GPS or street address |

**Privacy Considerations**

- **Encryption at rest**: Neon encrypts storage at rest by default — no column-level encryption is implemented in this MVP.
- **No deletion mechanism**: The MVP has no UI or API for users to request deletion of their data. If GDPR/PDPA compliance is required, a deletion endpoint must be added before launch in regulated markets.
- **Photo orphaning**: Deleting a row from the database does NOT delete the image from Cloudinary. Both must be removed together for complete erasure of a user's data.
- **Email stored in plaintext**: Email acts as the natural unique identifier and is stored without hashing — acceptable for a form submission store, not for an authentication system.
- **Access control**: Database credentials are stored as environment variables. No row-level security is configured — any service with `DATABASE_URL` has full read/write access. Admin access to submissions should be restricted at the infrastructure level.
- **Data retention period**: Indefinite for MVP. No automatic expiry, archival, or purge policy is implemented.
