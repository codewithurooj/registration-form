# Feature Specification: Registration API Endpoint

**Feature Branch**: `004-register-api`  
**Created**: 2026-06-25  
**Status**: Draft  

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Successful Registration Submission (Priority: P1)

A user completes the registration form with all valid fields including a photo and submits it. The system processes the request end-to-end — validating inputs, storing the photo, and saving the record — then signals success so the frontend can redirect to the Thank You page.

**Why this priority**: This is the entire purpose of the API. Every other story depends on this core happy path working correctly.

**Independent Test**: Submit a well-formed multipart POST request with all nine valid fields and a valid JPEG under 1 MB. Verify a 201 response with the new record's ID, and confirm the record exists in the database with the correct Cloudinary photo URL.

**Acceptance Scenarios**:

1. **Given** a valid multipart form payload with all nine fields and a valid photo, **When** the POST request is received, **Then** the API returns HTTP 201 with `{ success: true, id: <number> }` and the record is persisted.
2. **Given** a successful save, **When** the response is inspected, **Then** the `photo_url` stored in the database is a publicly accessible Cloudinary URL.

---

### User Story 2 — Validation Failure Returns Field-Level Errors (Priority: P2)

A user submits the form with one or more invalid or missing fields. The API responds with a structured error that maps directly back to each offending form field so the frontend can display inline error messages without guessing.

**Why this priority**: Without structured field errors, the frontend cannot provide actionable feedback — a broken form with no guidance is a blocker for all users.

**Independent Test**: Submit a POST with a missing email and an invalid mobile number. Verify a 422 response body where `errors` contains entries keyed to `email` and `mobile` with descriptive messages.

**Acceptance Scenarios**:

1. **Given** a payload missing the `email` field, **When** the POST is received, **Then** the response is HTTP 422 with `errors.email` containing "Email is required".
2. **Given** a payload with `mobile` set to `"abc"`, **When** the POST is received, **Then** the response is HTTP 422 with `errors.mobile` containing "Mobile must be 10–15 digits".
3. **Given** a payload with `interests` as an empty array, **When** the POST is received, **Then** the response is HTTP 422 with `errors.interests` containing "Select at least one interest".

---

### User Story 3 — Duplicate Email Rejected (Priority: P2)

A user attempts to register with an email address already present in the database. The API rejects the submission with a clear conflict response rather than silently overwriting or throwing a generic server error.

**Why this priority**: Email uniqueness is a business rule. A generic 500 on duplicate key would confuse both the frontend and the user.

**Independent Test**: Insert a record with `email = "test@example.com"`, then POST a new registration with the same email. Verify HTTP 409 with error code `DUPLICATE_EMAIL`.

**Acceptance Scenarios**:

1. **Given** a registration already exists for `user@example.com`, **When** a new POST arrives with the same email, **Then** the API returns HTTP 409 with `{ error: { code: "DUPLICATE_EMAIL", message: "An account with this email already exists." } }`.

---

### User Story 4 — File Validation Rejects Invalid Photos (Priority: P2)

A user submits a file that violates the type or size rules. The API catches this before attempting a Cloudinary upload and returns a specific error.

**Why this priority**: Uploading bad files wastes Cloudinary quota. Early rejection is both safer and cheaper.

**Independent Test**: POST with a `.pdf` file as `photo`. Verify HTTP 422 with `errors.photo` = "Only JPG and PNG files are accepted". Repeat with a valid JPEG over 1 MB — verify `errors.photo` = "Photo must be under 1 MB".

**Acceptance Scenarios**:

1. **Given** a GIF file attached as `photo`, **When** the POST is received, **Then** the API returns HTTP 422 with `errors.photo` containing the invalid file type message — Cloudinary is never called.
2. **Given** a valid JPEG that is 1.5 MB, **When** the POST is received, **Then** the API returns HTTP 422 with `errors.photo` containing the file size message.

---

### Edge Cases

- What happens if Cloudinary upload succeeds but the database write fails? The orphaned Cloudinary asset must be deleted; the user receives HTTP 502.
- What happens if the same user double-submits (e.g., double-click)? The unique email constraint catches the second request and returns 409.
- What happens if the request body is not multipart? Parsing fails and returns HTTP 400 with code `INVALID_CONTENT_TYPE`.
- What happens if `city` is valid but does not belong to the selected `country`? Server-side cross-field validation returns HTTP 422 with an error on `city`.
- What happens if no file is attached for `photo`? Treated as a missing required field — returns HTTP 422 with `errors.photo`.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The API MUST accept multipart/form-data POST requests containing all nine registration fields plus one photo file.
- **FR-002**: The API MUST validate all text fields server-side using the same rules defined in the validation spec, independent of any client-side validation.
- **FR-003**: The API MUST validate the photo file for MIME type (jpg/jpeg/png only) and size (max 1 MB) before any upload attempt.
- **FR-004**: The API MUST upload the photo to external storage only after all validation passes.
- **FR-005**: The API MUST persist all registration fields plus the photo URL to the database in a single atomic operation.
- **FR-006**: The API MUST return HTTP 201 with the new record ID on success.
- **FR-007**: The API MUST return HTTP 422 with field-keyed error messages when validation fails.
- **FR-008**: The API MUST return HTTP 409 when the submitted email already exists in the database.
- **FR-009**: The API MUST return HTTP 500/502 with a generic error message for unrecoverable server failures, without leaking internal stack traces or environment details.
- **FR-010**: The API MUST cross-validate that the submitted `city` belongs to the submitted `country` using the same country-city mapping as the frontend.
- **FR-011**: The API MUST NOT write to the database if photo upload fails.
- **FR-012**: If photo upload succeeds but database write fails, the API MUST attempt to delete the uploaded photo asset and return HTTP 502.

### Key Entities

- **Registration**: A single form submission. Contains personal details (name, email, mobile, date of birth, gender), preferences (interests array), location (country, city), and a photo reference. Each registration is identified by a unique auto-incremented ID and a unique email address.
- **Photo Asset**: The image file uploaded by the user. Stored in an external image host; only its URL is saved in the Registration record. Tied to exactly one registration.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A valid registration request completes end-to-end (validation + photo upload + database save + response) in under 5 seconds under normal network conditions.
- **SC-002**: 100% of validation errors surface the specific field name and a human-readable message — zero "something went wrong" responses for invalid input that can be caught by validation rules.
- **SC-003**: Duplicate email submissions are rejected with a distinct response code 100% of the time, never silently accepted or producing a server error.
- **SC-004**: Invalid or oversized photo files are rejected before any external service is contacted in 100% of cases.
- **SC-005**: Zero internal error details (stack traces, query text, environment variable names) appear in any API response body.

### Assumptions

- The country-city mapping is hardcoded on the server (mirroring the frontend) — no external lookup is needed.
- No rate limiting is in scope for this evaluation project; the unique email constraint is the primary anti-abuse mechanism.
- File MIME type is validated by inspecting the file content (magic bytes or parser-reported mimetype), not solely the file extension.
- The API does not send confirmation emails — that is out of scope.
- Only one photo per registration is allowed; re-submissions are not supported (users who need to change data must contact support).
