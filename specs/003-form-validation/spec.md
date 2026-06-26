# Feature Specification: Form Validation Rules

**Feature Branch**: `003-form-validation`  
**Created**: 2026-06-25  
**Status**: Draft  
**Input**: Validation specification for registration form — client-side (react-hook-form + Zod) and server-side (Next.js API route) validation rules, exact error messages, Zod schema outline, and edge case handling.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Happy Path: Valid Submission (Priority: P1)

A user fills in all registration fields correctly and submits the form. Every field passes client-side validation immediately, the photo is accepted, and the form submits without errors.

**Why this priority**: The golden path must work perfectly before edge cases matter.

**Independent Test**: Fill all fields with valid data, click Submit, and verify that no inline error messages appear and the form data is sent to the API.

**Acceptance Scenarios**:

1. **Given** all fields are filled with valid data, **When** the user clicks Submit, **Then** no validation errors appear and the form data is sent to the API.
2. **Given** a user selects "India" as country, **When** they select "Mumbai" as city, **Then** no cross-field error appears.
3. **Given** a user uploads a 500 KB PNG file, **When** they click Submit, **Then** the file is accepted without an error.

---

### User Story 2 — Inline Feedback: Errors on Blur (Priority: P2)

A user moves through fields one at a time. When they leave a field empty or with invalid input, an inline error appears under that field immediately — without submitting the form.

**Why this priority**: Inline feedback is the primary UX mechanism for guiding users to correct errors before they ever hit Submit.

**Independent Test**: Tab through the form leaving fields empty and verify that a red error message appears beneath each field after it loses focus.

**Acceptance Scenarios**:

1. **Given** the Full Name field is empty, **When** the user tabs away, **Then** "Full name is required." appears below the field.
2. **Given** the Email field contains "notanemail", **When** the user tabs away, **Then** "Please enter a valid email address." appears.
3. **Given** the Mobile field contains letters, **When** the user tabs away, **Then** "Mobile number must contain only digits." appears.

---

### User Story 3 — Submit-Time Catch-All: All Errors Surfaced (Priority: P3)

A user clicks Submit without filling in any fields. All required-field errors appear simultaneously so the user can see every problem at once.

**Why this priority**: Submit-time validation is a safety net; inline feedback is preferred but not infallible.

**Independent Test**: Click Submit on a blank form and verify that every required-field error message is visible on screen at the same time.

**Acceptance Scenarios**:

1. **Given** the form is completely empty, **When** the user clicks Submit, **Then** error messages appear for all 9 required fields simultaneously.
2. **Given** only some fields are filled, **When** the user clicks Submit, **Then** error messages appear only for the remaining invalid fields.

---

### User Story 4 — Server Rejection: API Validation Failure (Priority: P4)

A client submits data that passes client-side validation but the server re-validates and rejects it (e.g., a manually crafted request or a race condition). The form displays field-level server errors mapped back to the correct fields.

**Why this priority**: Server-side defense is mandatory; the UI must handle server rejection gracefully.

**Independent Test**: Send a POST to `/api/register` with a missing required field and verify the response is `400` with a structured JSON error body matching the documented format.

**Acceptance Scenarios**:

1. **Given** a POST is sent with an invalid email, **When** the API validates it, **Then** the response is `{ "success": false, "errors": { "email": "Please enter a valid email address." } }` with HTTP 400.
2. **Given** a city value does not belong to the selected country, **When** the API validates it, **Then** the response includes `{ "errors": { "city": "Please select a valid city for the selected country." } }`.

---

### Edge Cases

- What happens when a user pastes content into a text field instead of typing?
- What happens when the mobile number includes a leading `+` or country code?
- What happens when a text field contains only whitespace?
- What happens when a user uploads a `.webp` or `.gif` file instead of jpg/png?
- What happens when the file exceeds 1 MB by a single byte?
- What happens when browser autofill populates a city that does not match the selected country?
- What happens when the form is submitted twice rapidly (double-click)?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST validate all 9 form fields on the client before allowing form submission.
- **FR-002**: System MUST display an inline error message beneath each field that fails validation, immediately on blur.
- **FR-003**: System MUST display all field errors simultaneously when the user clicks Submit on an invalid form.
- **FR-004**: System MUST clear a field's error message as soon as the user corrects the value (on change, after the first submit attempt).
- **FR-005**: System MUST re-validate all fields server-side in the API route, regardless of client validation outcome.
- **FR-006**: System MUST return HTTP 400 with a structured JSON error body when server validation fails.
- **FR-007**: System MUST map server-returned field errors back to the corresponding form fields and display them inline.
- **FR-008**: System MUST validate City against the selected Country — a city not belonging to the country MUST be rejected.
- **FR-009**: System MUST strip leading and trailing whitespace from all text inputs before validating minimum length.
- **FR-010**: System MUST reject photo files whose MIME type is not `image/jpeg` or `image/png`, even if the file extension appears correct.
- **FR-011**: System MUST reject photo files larger than 1,048,576 bytes (1 MB).
- **FR-012**: System MUST prevent form resubmission while a previous submission is in flight (disable Submit button on pending).

### Key Entities

- **ValidationRule**: A single check applied to one field — has a condition and an associated error message string.
- **CrossFieldRule**: A validation that reads two or more field values — City/Country dependency and Date of Birth past-date check.
- **ServerValidationResponse**: The structured JSON body the API returns on validation failure — contains `success: false` and an `errors` map of field name to error message string.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every required field shows its error message within 50 ms of the user leaving the field (blur latency imperceptible to users).
- **SC-002**: Submitting a blank form surfaces 100% of required-field error messages in a single render cycle — no errors are hidden or deferred.
- **SC-003**: A server-rejected submission displays the correct field-level error message on screen within the normal network round-trip time — no additional user action required.
- **SC-004**: Zero valid submissions are rejected by client or server validation (false-positive rate = 0%).
- **SC-005**: All validation error messages use plain, non-technical language understandable by a non-technical user.
- **SC-006**: The client and server apply identical rules — no scenario exists where client accepts data that the server rejects due to a rule mismatch.

---

## Validation Strategy

### When Validation Fires

| Trigger | Fields | Rationale |
| ------- | ------ | --------- |
| **On blur** (field loses focus) | Full Name, Email, Mobile, Date of Birth | Immediate feedback after the user finishes entering text; does not interrupt mid-typing |
| **On blur** | Gender (radio group), Interests (checkbox group) | Fires when focus leaves the entire group |
| **On blur** | Country, City | Fires on dropdown close |
| **On blur** | Photo | Fires when file input loses focus after selection |
| **On change** (live, after first submit) | Full Name, Email, Mobile | Switches from blur-only to live once the user has attempted a submission, to help correct errors in real time |
| **On submit** | All fields | Full-form check; surfaces any field that was never touched |
| **On server** | All fields + file | Re-validates everything in the API route; never trusts the client; returns structured errors |

### Strategy Rationale

- **Blur-first**: Avoids showing errors while the user is still typing (frustrating UX).
- **On-change after first submit**: Once a user has tried submitting, they expect live feedback while correcting.
- **Submit catch-all**: Catches fields the user skipped entirely (tabbed past without touching).
- **Server re-validation**: Protects against manipulated requests, browser extensions, and race conditions.

---

## Field Validation Rules

### Full Name

| Rule | Condition | Error Message |
| ---- | --------- | ------------- |
| Required | Field is empty or whitespace-only | "Full name is required." |
| Min length | Trimmed value is fewer than 2 characters | "Full name must be at least 2 characters." |
| Max length | Trimmed value is longer than 100 characters | "Full name must be 100 characters or fewer." |

### Email Address

| Rule | Condition | Error Message |
| ---- | --------- | ------------- |
| Required | Field is empty | "Email address is required." |
| Format | Value does not match a valid email pattern | "Please enter a valid email address." |
| Max length | Value exceeds 254 characters | "Email address must be 254 characters or fewer." |

### Mobile Number

| Rule | Condition | Error Message |
| ---- | --------- | ------------- |
| Required | Field is empty | "Mobile number is required." |
| Digits only | Value contains any character other than 0 through 9 | "Mobile number must contain only digits." |
| Min length | Fewer than 10 digits | "Mobile number must be at least 10 digits." |
| Max length | More than 15 digits | "Mobile number must be 15 digits or fewer." |

Users MUST enter the number without a leading `+` or country code prefix. The field label clarifies this. A leading `+` fails the digits-only rule.

### Date of Birth

| Rule | Condition | Error Message |
| ---- | --------- | ------------- |
| Required | No date selected | "Date of birth is required." |
| Valid date | Value cannot be parsed as a date | "Please enter a valid date." |
| Past date | Selected date is today or in the future | "Date of birth must be in the past." |
| Minimum age | Selected date is within the last 13 years | "You must be at least 13 years old to register." |

### Gender

| Rule | Condition | Error Message |
| ---- | --------- | ------------- |
| Required | No option selected | "Please select your gender." |
| Valid value | Value is not one of: `male`, `female`, `other` | "Please select a valid gender option." |

### Interests

| Rule | Condition | Error Message |
| ---- | --------- | ------------- |
| Required (min 1) | No checkbox is checked | "Please select at least one interest." |
| Valid values | Any submitted value is not in the allowed list | "One or more selected interests are not valid." |

Allowed values: `Technology`, `Sports`, `Music`, `Travel`, `Reading`, `Gaming`.

### Country

| Rule | Condition | Error Message |
| ---- | --------- | ------------- |
| Required | No country selected | "Please select your country." |
| Valid value | Value is not in the supported country list | "Please select a valid country." |

Supported countries: `UAE`, `India`, `Pakistan`, `USA`, `UK`.

### City

| Rule | Condition | Error Message |
| ---- | --------- | ------------- |
| Required | No city selected | "Please select your city." |
| Belongs to country | City is not in the city list for the selected country | "Please select a valid city for the selected country." |

### Photo

| Rule | Condition | Error Message |
| ---- | --------- | ------------- |
| Required | No file selected | "Please upload a photo." |
| File type | MIME type is not `image/jpeg` or `image/png` | "Only JPG and PNG files are accepted." |
| File size | File size exceeds 1,048,576 bytes | "Photo must be smaller than 1 MB." |

---

## Exact Error Messages

The following strings are the canonical error messages. They MUST appear in the UI exactly as written.

```
Full Name
  Required:    "Full name is required."
  Min length:  "Full name must be at least 2 characters."
  Max length:  "Full name must be 100 characters or fewer."

Email Address
  Required:    "Email address is required."
  Format:      "Please enter a valid email address."
  Max length:  "Email address must be 254 characters or fewer."

Mobile Number
  Required:    "Mobile number is required."
  Digits only: "Mobile number must contain only digits."
  Min length:  "Mobile number must be at least 10 digits."
  Max length:  "Mobile number must be 15 digits or fewer."

Date of Birth
  Required:    "Date of birth is required."
  Invalid:     "Please enter a valid date."
  Past date:   "Date of birth must be in the past."
  Min age:     "You must be at least 13 years old to register."

Gender
  Required:    "Please select your gender."
  Invalid:     "Please select a valid gender option."

Interests
  Required:    "Please select at least one interest."
  Invalid:     "One or more selected interests are not valid."

Country
  Required:    "Please select your country."
  Invalid:     "Please select a valid country."

City
  Required:    "Please select your city."
  Cross-field: "Please select a valid city for the selected country."

Photo
  Required:    "Please upload a photo."
  File type:   "Only JPG and PNG files are accepted."
  File size:   "Photo must be smaller than 1 MB."

Server / Generic
  Network error:   "Something went wrong. Please try again."
  Duplicate email: "An account with this email already exists."
```

---

## Cross-Field Validation

### Rule 1: City Must Belong to Selected Country

**Condition**: The `city` value must be one of the cities listed for the selected `country` in the hardcoded `COUNTRY_CITIES` map.

**Client implementation**: When the country dropdown changes, reset the city dropdown to empty and repopulate its options from `COUNTRY_CITIES`. Zod `.superRefine()` cross-checks the pair at submit time using the same map.

**Server implementation**: The API route imports the same `COUNTRY_CITIES` map and verifies `COUNTRY_CITIES[country]?.includes(city)`. If false, attaches an error to the `city` field.

**Error message**: "Please select a valid city for the selected country."

**Autofill edge case**: If a browser autofills a city that does not match the current country after a country change, the cross-field check catches it on blur or submit.

---

### Rule 2: Date of Birth Must Be in the Past

**Condition**: The parsed date must be strictly before today's date at midnight (UTC).

**Client and server**: Both apply `.refine(date => date < new Date(), "...")` at validation time — not against a hardcoded date.

**Error message**: "Date of birth must be in the past."

**Boundary**: A date equal to today fails this check. A date of yesterday passes.

---

### Rule 3: Minimum Age (13 years)

**Condition**: The submitted date must be at least 13 years before today.

**Client and server**: Both apply `.refine(date => { const min = new Date(); min.setFullYear(min.getFullYear() - 13); return date <= min; }, "...")`.

**Error message**: "You must be at least 13 years old to register."

**Boundary**: The day of the user's 13th birthday is the earliest accepted date.

---

## File Validation

### Client-Side (before upload)

Performed in the file input's `onChange` handler, before the form is submitted.

| Check | How | Error Message |
| ----- | --- | ------------- |
| File selected | File object is defined | "Please upload a photo." |
| MIME type | Check `file.type` against `["image/jpeg", "image/png"]` | "Only JPG and PNG files are accepted." |
| File size | Check `file.size <= 1_048_576` | "Photo must be smaller than 1 MB." |

If any check fails, a react-hook-form field error is set on `photo` and submission does not proceed.

### Server-Side (API route)

The API route receives the file as a `FormData` blob and re-checks:

| Check | How | Error Message |
| ----- | --- | ------------- |
| File present | `formData.get("photo")` is a File instance | "Please upload a photo." |
| MIME type | Check runtime MIME against `["image/jpeg", "image/png"]` — uses actual MIME from the parser, not file extension | "Only JPG and PNG files are accepted." |
| File size | Check `file.size <= 1_048_576` | "Photo must be smaller than 1 MB." |

### When Server Rejects a File the Client Accepted

1. The API returns HTTP 400 with `{ "success": false, "errors": { "photo": "Only JPG and PNG files are accepted." } }`.
2. The frontend maps this error back to the `photo` field and displays the message beneath the file input.
3. The file input is reset (cleared) so the user must re-select a file.
4. No partial data is written to the database.

---

## Zod Schema Outline

```typescript
// lib/validations.ts — shared between client (react-hook-form resolver) and server (API route)

const VALID_COUNTRIES = ["UAE", "India", "Pakistan", "USA", "UK"] as const
const VALID_INTERESTS = ["Technology", "Sports", "Music", "Travel", "Reading", "Gaming"] as const
// COUNTRY_CITIES imported from lib/countries.ts

export const registrationSchema = z.object({
  fullName:    z.string().trim().min(1, "Full name is required.").min(2, "Full name must be at least 2 characters.").max(100, "Full name must be 100 characters or fewer."),
  email:       z.string().min(1, "Email address is required.").email("Please enter a valid email address.").max(254, "Email address must be 254 characters or fewer."),
  mobile:      z.string().min(1, "Mobile number is required.").regex(/^\d+$/, "Mobile number must contain only digits.").min(10, "Mobile number must be at least 10 digits.").max(15, "Mobile number must be 15 digits or fewer."),
  dateOfBirth: z.coerce.date({ required_error: "Date of birth is required.", invalid_type_error: "Please enter a valid date." })
                 .refine(d => d < new Date(), "Date of birth must be in the past.")
                 .refine(d => { const min = new Date(); min.setFullYear(min.getFullYear() - 13); return d <= min; }, "You must be at least 13 years old to register."),
  gender:      z.enum(["male", "female", "other"], { required_error: "Please select your gender.", invalid_type_error: "Please select a valid gender option." }),
  interests:   z.array(z.enum(VALID_INTERESTS, { invalid_type_error: "One or more selected interests are not valid." })).min(1, "Please select at least one interest."),
  country:     z.enum(VALID_COUNTRIES, { required_error: "Please select your country.", invalid_type_error: "Please select a valid country." }),
  city:        z.string().min(1, "Please select your city."),
}).superRefine((data, ctx) => {
  const validCities = COUNTRY_CITIES[data.country] ?? []
  if (!validCities.includes(data.city)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select a valid city for the selected country.", path: ["city"] })
  }
})

// Photo validated separately as a File object — not part of the schema above
export const MAX_PHOTO_SIZE = 1_048_576
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png"]
```

---

## Server-Side Validation Response

### Success

```json
HTTP 200
{
  "success": true,
  "data": { "id": 42 }
}
```

### Validation Failure

```json
HTTP 400
{
  "success": false,
  "errors": {
    "fieldName": "Exact error message string."
  }
}
```

**Rules**:
- `errors` is a flat object. Keys are the camelCase field names matching the Zod schema (`fullName`, `email`, `mobile`, `dateOfBirth`, `gender`, `interests`, `country`, `city`, `photo`).
- Each key maps to a single string — the first error for that field (take index 0 from Zod's `.flatten().fieldErrors`).
- Cross-field errors are attached to the dependent field (`city` for a country/city mismatch).
- Non-field errors (e.g., database failure) use the reserved key `"_form"`:

```json
HTTP 500
{
  "success": false,
  "errors": {
    "_form": "Something went wrong. Please try again."
  }
}
```

### Frontend Mapping

```typescript
// After receiving a non-200 response from /api/register:
const { errors } = await response.json()
Object.entries(errors).forEach(([field, message]) => {
  if (field === "_form") {
    setFormError(message)      // displayed as a banner above the submit button
  } else {
    setError(field as keyof FormValues, { type: "server", message })
  }
})
```

---

## Edge Cases

| Scenario | Handling |
| -------- | -------- |
| Paste instead of typing | On-change and on-blur both fire after paste; validation runs normally. No special handling needed. |
| Mobile with leading `+` or country code | The digits-only regex rejects any `+` or spaces. Field label instructs users to omit the country code. Error: "Mobile number must contain only digits." |
| Whitespace-only text input | All string fields apply `.trim()` before checking minimum length. A string of spaces is treated as empty and fails the required check. |
| SQL injection / XSS in text fields | Drizzle ORM uses parameterized queries (prevents SQL injection). React escapes output (prevents XSS). No additional sanitization at the validation layer is needed. |
| Browser autofill with wrong city | Country change resets the city dropdown. If autofill writes a stale city afterward, the cross-field check catches it on blur or submit with "Please select a valid city for the selected country." |
| File with deceptive extension (e.g., `.jpg` but MIME `image/webp`) | Server checks `file.type` at runtime, not the filename. Incorrect MIME causes rejection with "Only JPG and PNG files are accepted." |
| File exactly at 1 MB (1,048,576 bytes) | Accepted (`file.size <= 1_048_576`). 1,048,577 bytes is rejected. |
| Double-click Submit | Submit button is disabled and shows a loading state as soon as the first submission starts. Subsequent clicks are ignored until the response returns. |
| Date of birth = today | Fails the past-date check. Error: "Date of birth must be in the past." |
| Date of birth exactly 13 years ago today | Accepted (`d <= minAge` where `minAge` is exactly 13 years ago). The day of the 13th birthday is the earliest valid date. |

---

## Assumptions

1. Mobile number field does not accept or store country codes — users enter local numbers only. Field label will clarify this.
2. The minimum age of 13 years aligns with COPPA and general internet practice; no explicit age requirement was stated in the original brief.
3. Email uniqueness is enforced at the database level, not via Zod. A duplicate email is caught at DB insertion and surfaced as a server error under the `"email"` key or `"_form"` key.
4. The supported country list is fixed. Adding a country requires a code change to `/lib/countries.ts`, not a spec change.
5. Photo MIME type is detected from the parsed file object, not from the file extension.
