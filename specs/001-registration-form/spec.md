# Feature Specification: Registration Form Web Application

**Feature Branch**: `001-registration-form`  
**Created**: 2026-06-25  
**Status**: Draft  
**Input**: Client evaluation task — build a registration form with photo upload, dependent dropdowns, and a post-submit Thank You page.

---

## Overview

This product is a single-page user registration form built as a client evaluation deliverable. It collects personal information (name, email, mobile number, date of birth, gender), preferences (interests), location data (country and city via a dependent dropdown), and a profile photo from prospective registrants. Upon successful submission, all data is persisted and the user is directed to a Thank You confirmation page. The primary audience is any end-user directed to the form who needs to complete a registration in order to express interest or enrol in a program.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Complete and Submit the Registration Form (Priority: P1)

As a **registrant**, I want to fill in all required fields and submit the form, so that my information is captured and I receive confirmation that my registration was received.

**Why this priority**: Core happy-path scenario; all other stories depend on the form being submittable.

**Independent Test**: Navigate to the form, fill every field with valid data, and click Submit. Verify data is saved and the Thank You page appears.

**Acceptance Scenarios**:

1. **Given** the user is on the registration page, **When** they fill in all required fields with valid values and click Submit, **Then** the form data is saved to the database and the user is redirected to the Thank You page.
2. **Given** the user has not filled in one or more required fields, **When** they click Submit, **Then** the form does not submit and inline validation error messages appear next to each empty required field.
3. **Given** the user has successfully submitted the form, **When** the Thank You page loads, **Then** it displays a success message confirming the registration was received (e.g., "Thank you! Your registration has been submitted successfully.").
4. **Given** the form is submitted with all valid data, **When** the server processes the submission, **Then** all nine fields (Full Name, Email, Mobile Number, Date of Birth, Gender, at least one Interest, Country, City, Photo URL) are stored as a single registration record.

---

### User Story 2 — Interact with the Dependent City Dropdown (Priority: P2)

As a **registrant**, I want the City dropdown to automatically update based on the Country I select, so that I only see cities relevant to my chosen country.

**Why this priority**: Key UX behaviour that prevents invalid country/city combinations from being submitted.

**Independent Test**: Select a country and verify only that country's cities appear in the City dropdown; change the country and verify the city list updates.

**Acceptance Scenarios**:

1. **Given** the user has not yet selected a Country, **When** the form loads, **Then** the City dropdown is disabled (or empty with a placeholder like "Select a country first").
2. **Given** the user selects "UAE" from the Country dropdown, **When** the selection is made, **Then** the City dropdown is enabled and contains exactly: Dubai, Sharjah, Abu Dhabi.
3. **Given** the user selects "India" from the Country dropdown, **When** the selection is made, **Then** the City dropdown contains exactly: Mumbai, Delhi, Bangalore.
4. **Given** the user selects "Pakistan" from the Country dropdown, **When** the selection is made, **Then** the City dropdown contains exactly: Karachi, Lahore, Islamabad.
5. **Given** the user selects "USA" from the Country dropdown, **When** the selection is made, **Then** the City dropdown contains exactly: New York, Los Angeles, Chicago.
6. **Given** the user selects "UK" from the Country dropdown, **When** the selection is made, **Then** the City dropdown contains exactly: London, Manchester, Birmingham.
7. **Given** the user has selected a Country and a City, **When** they change the Country to a different value, **Then** the City dropdown resets to its empty/disabled state and a new city must be selected before submission.

---

### User Story 3 — Upload a Valid Profile Photo (Priority: P2)

As a **registrant**, I want to upload a profile photo in JPG or PNG format under 1 MB, so that my photo is stored with my registration.

**Why this priority**: File upload is a distinct interaction with clear constraints that must be verified independently of form submission.

**Independent Test**: Select a valid JPG/PNG file under 1 MB; submit the form; verify the Cloudinary URL is persisted in the database record.

**Acceptance Scenarios**:

1. **Given** the user selects a `.jpg`, `.jpeg`, or `.png` file that is 1 MB or smaller, **When** the form is submitted, **Then** the file is uploaded to Cloudinary, the returned URL is stored in the database, and the submission succeeds.
2. **Given** the user selects a file with an unsupported type (e.g., `.gif`, `.pdf`, `.webp`, `.bmp`), **When** the file is chosen or the form is submitted, **Then** an error message is displayed (e.g., "Only JPG, JPEG, and PNG files are accepted") and the form does not submit.
3. **Given** the user selects a `.jpg` or `.png` file that exceeds 1 MB, **When** the file is chosen or the form is submitted, **Then** an error message is displayed (e.g., "File size must not exceed 1 MB") and the form does not submit.
4. **Given** the user has selected a valid file, **When** the form is submitted successfully, **Then** the database record contains a non-empty URL pointing to the uploaded image on Cloudinary.

---

### User Story 4 — See and Fix Validation Errors (Priority: P2)

As a **registrant**, I want to see clear error messages next to each invalid field when I submit the form incorrectly, so that I know exactly what to fix without losing any data I've already entered.

**Why this priority**: Without clear validation feedback, users cannot self-correct and may abandon the form.

**Independent Test**: Submit the form with multiple invalid fields; verify each invalid field shows a specific error message; correct all fields; resubmit and verify success.

**Acceptance Scenarios**:

1. **Given** the user submits the form with an invalid email format (e.g., "user@" or "notanemail"), **When** the form is validated, **Then** an error message appears next to the Email field stating "Please enter a valid email address".
2. **Given** the user submits the form leaving the Full Name field empty, **When** the form is validated, **Then** an error message appears next to Full Name stating "Full Name is required".
3. **Given** the user has previously submitted with errors and now corrects a field, **When** they resubmit or the field loses focus after correction, **Then** the error message for that field disappears.
4. **Given** the user submits with multiple errors, **When** validation runs, **Then** all invalid fields display their individual error messages simultaneously (not one at a time).
5. **Given** the user has entered data in valid fields before hitting Submit, **When** validation errors appear, **Then** the previously entered valid data remains in those fields (no data loss on failed submission).

---

### User Story 5 — View the Thank You Page After Submission (Priority: P1)

As a **registrant**, I want to see a Thank You confirmation page after submitting the form successfully, so that I know my registration was received.

**Why this priority**: Without confirmation, users cannot know whether their submission was successful.

**Independent Test**: Submit a valid form and verify the Thank You page renders with a success message.

**Acceptance Scenarios**:

1. **Given** the user submits the form with all valid data, **When** the server confirms the record is saved, **Then** the user is navigated to a distinct Thank You page (different URL or route from the form page).
2. **Given** the user is on the Thank You page, **When** the page loads, **Then** it displays a success message that includes the phrase "Thank you" or equivalent affirmation.
3. **Given** the user is on the Thank You page, **When** they attempt to navigate directly to the Thank You URL without having submitted the form, **Then** they are redirected to the registration form page (to prevent empty confirmation pages).

---

### Edge Cases

- What happens when the Cloudinary upload succeeds but the database write fails? (The photo URL should not be orphaned; the submission should return an error.)
- What happens when the user submits the form while already on a slow connection and the request times out? (A user-facing error should appear without data loss.)
- What happens if the user enters a Mobile Number with letters or special characters? (Field should validate for digits only, with optional leading `+` for international format.)
- What happens if a user enters a Date of Birth in the future? (The form should reject future dates.)
- What happens if no interests are checked? (Either Interests is optional and the form submits, or it is required and shows an error — see Open Questions.)

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a single-page registration form with the following fields: Full Name, Email, Mobile Number, Date of Birth, Gender, Interests, Country, City, and Photo Upload.
- **FR-002**: System MUST mark Full Name, Email, Mobile Number, Date of Birth, Gender, Country, City, and Photo Upload as required fields.
- **FR-003**: System MUST validate that Full Name is not empty and contains at least 2 characters.
- **FR-004**: System MUST validate that the Email field contains a properly formatted email address (standard RFC 5322 format).
- **FR-005**: System MUST validate that Mobile Number contains only digits and an optional leading `+`, with a minimum of 7 digits and a maximum of 15 digits.
- **FR-006**: System MUST provide a date picker for Date of Birth and reject future dates.
- **FR-007**: System MUST provide Gender as a radio button group with exactly three options: Male, Female, Other.
- **FR-008**: System MUST provide Interests as a group of checkboxes (options to be defined; see Open Questions).
- **FR-009**: System MUST provide a Country dropdown populated with exactly five countries: UAE, India, Pakistan, USA, UK.
- **FR-010**: System MUST provide a City dropdown that is disabled until a Country is selected.
- **FR-011**: System MUST populate the City dropdown with the following cities based on the selected Country:
  - UAE → Dubai, Sharjah, Abu Dhabi
  - India → Mumbai, Delhi, Bangalore
  - Pakistan → Karachi, Lahore, Islamabad
  - USA → New York, Los Angeles, Chicago
  - UK → London, Manchester, Birmingham
- **FR-012**: System MUST reset the City dropdown whenever the user changes their Country selection.
- **FR-013**: System MUST provide a file upload control for Photo that accepts only `.jpg`, `.jpeg`, and `.png` file types.
- **FR-014**: System MUST reject photo files larger than 1 MB and display an error message.
- **FR-015**: System MUST reject photo files with unsupported MIME types or extensions and display an error message.
- **FR-016**: System MUST upload accepted photos to Cloudinary and store the returned URL in the registration record.
- **FR-017**: System MUST display inline validation error messages next to each invalid field when the user attempts to submit the form.
- **FR-018**: System MUST prevent form submission until all required fields pass validation.
- **FR-019**: System MUST preserve all previously entered valid field values when displaying validation errors.
- **FR-020**: System MUST save the complete registration record (all nine fields including Cloudinary photo URL) to the database on successful submission.
- **FR-021**: System MUST redirect the user to a Thank You page upon successful form submission.
- **FR-022**: The Thank You page MUST display a success confirmation message to the user.
- **FR-023**: System MUST redirect users who navigate directly to the Thank You URL (without a valid submission) back to the registration form.

### Key Entities

- **Registration**: Represents a single form submission. Attributes: full name, email address, mobile number, date of birth, gender, list of selected interests, country, city, photo URL (from Cloudinary), submission timestamp.
- **Country–City Mapping**: Static reference data defining which cities belong to each supported country. Not persisted dynamically; defined in application configuration.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A registrant with a stable internet connection can complete and submit the form in under 3 minutes.
- **SC-002**: 95% of users who reach the form page can successfully submit without contacting support.
- **SC-003**: Photo upload and form submission complete within 5 seconds for files up to 1 MB on a standard broadband connection.
- **SC-004**: All validation errors are surfaced in a single submission attempt — zero cases where a user must submit more than once to discover all errors simultaneously present.
- **SC-005**: 100% of successful submissions result in a complete database record (no missing required fields) and a reachable Cloudinary photo URL.
- **SC-006**: The form renders correctly and is fully usable on screen widths from 375 px (mobile) to 1440 px (desktop).

---

## Non-Functional Requirements

### Performance

- The registration page must reach interactive state within 3 seconds on a 4G mobile connection.
- Photo upload to Cloudinary must complete within 5 seconds for files up to 1 MB.
- The database write must complete within 2 seconds under normal load.

### Browser Support

- The form must work correctly in the latest two major versions of Chrome, Firefox, Safari, and Edge.
- The date picker must be operable on both desktop and mobile touch interfaces.

### Accessibility

- All form fields must have associated `<label>` elements.
- Error messages must be programmatically associated with their fields (using `aria-describedby` or equivalent).
- The form must be fully keyboard-navigable (tab order must follow visual order).
- Colour contrast for text and interactive elements must meet WCAG 2.1 AA minimum (4.5:1 for normal text).

### Mobile Responsiveness

- The form layout must reflow to a single-column stack on viewports narrower than 768 px.
- Touch targets (buttons, radio buttons, checkboxes) must be at least 44 × 44 CSS pixels.
- The file upload control must work on mobile browsers (iOS Safari, Android Chrome).

### Security

- Photo file type must be validated on the server side (not only in the browser) before uploading to Cloudinary.
- All database inputs must be parameterized to prevent SQL injection.
- Uploaded photo URLs stored in the database must originate exclusively from Cloudinary.

---

## Out of Scope

- **User authentication or login**: No accounts, passwords, or sessions.
- **Edit or delete submissions**: Once submitted, a record cannot be modified through this form.
- **Admin panel or submissions dashboard**: No interface for reviewing or managing submitted registrations.
- **Email notifications**: No confirmation emails to the registrant or administrators.
- **Pagination or listing of registrations**: The form is a write-only interface.
- **Social login or OAuth**: Registration is anonymous and unauthenticated.
- **Multi-step or wizard-style forms**: The form is a single page.
- **Internationalisation (i18n) or multi-language support**: English only.
- **Duplicate detection**: No logic to detect or prevent duplicate submissions from the same email address.
- **CAPTCHA or bot protection**: Out of scope for this evaluation task.
- **Analytics or tracking**: No event tracking or third-party analytics integration.
- **Countries or cities beyond the five listed**: Only UAE, India, Pakistan, USA, and UK are supported.

---

## Open Questions

1. **Interests checkbox options**: The specification does not define what interest categories to present (e.g., Sports, Technology, Music, Travel). What are the valid interest options, and is at least one selection required?

2. **Mobile Number format**: Should the Mobile Number field enforce a specific country code or international format (e.g., E.164 `+971XXXXXXXXX`), or accept any numeric string of 7–15 digits regardless of format?

3. **Minimum age constraint**: Should Date of Birth enforce a minimum age (e.g., registrant must be at least 18 years old), or is any past date acceptable?

---

## Assumptions

- Interests field will have a reasonable set of 4–8 predefined options to be confirmed by the client (placeholder options used during development: Sports, Technology, Music, Travel, Art, Reading).
- Mobile Number accepts digits and an optional leading `+`, with no country-code enforcement, minimum 7 digits, maximum 15 digits.
- No minimum age is enforced — any past date of birth is valid.
- The Photo Upload field is required; the form cannot be submitted without a photo.
- The Thank You page is a separate route (e.g., `/thank-you`) and not a modal or inline message.
- Cloudinary credentials (cloud name, API key, API secret) will be provided via environment variables; they are not part of this specification.
- Database schema will store each form submission as one row; no relational lookup table is needed for interests (stored as a serialised list or array column).
