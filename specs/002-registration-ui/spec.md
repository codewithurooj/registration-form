# Feature Specification: Registration Form UI

**Feature Branch**: `002-registration-ui`  
**Created**: 2026-06-25  
**Status**: Draft  
**Input**: User description: "Create UI specification for registration form web application with all form fields, dependent dropdowns, file upload, and thank-you page"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Registration Successfully (Priority: P1)

A prospective registrant visits the homepage, fills in all required fields correctly, uploads a valid photo, and submits the form. They are redirected to the Thank You page confirming their submission.

**Why this priority**: This is the core, end-to-end happy path. Without it the product has no value.

**Independent Test**: Open `/`, fill every field with valid data, click "Submit Registration", verify redirect to `/thank-you` with the registrant's name displayed.

**Acceptance Scenarios**:

1. **Given** the form is empty, **When** the user fills all fields correctly and clicks Submit, **Then** the form submits, a loading indicator appears on the button, and the user is navigated to `/thank-you`.
2. **Given** the user is on `/thank-you`, **When** the page loads, **Then** the page displays the heading "Thank You, [First Name]!" and a "Back to Home" link.

---

### User Story 2 - See Validation Errors on Invalid Submission (Priority: P2)

A user attempts to submit the form with one or more invalid or empty fields. Inline error messages appear below each invalid field without losing any already-typed valid data.

**Why this priority**: Prevents data loss and guides the user toward a valid submission.

**Independent Test**: Click Submit on an empty form; verify error messages appear under every required field; verify no fields are cleared.

**Acceptance Scenarios**:

1. **Given** the form is empty, **When** the user clicks Submit, **Then** inline error messages appear below every required field and the submit button returns to its default state.
2. **Given** the user typed an invalid email, **When** the form is submitted, **Then** only the Email field shows an error; other valid fields retain their values.

---

### User Story 3 - Dependent City Dropdown Updates on Country Change (Priority: P2)

When the user selects a country, the City dropdown immediately populates with cities for that country. If the user changes the country, the city selection resets and the new country's cities load.

**Why this priority**: Without this, users cannot complete the Country/City fields correctly.

**Independent Test**: Select "UAE" from Country; verify City shows Dubai, Sharjah, Abu Dhabi. Change Country to "India"; verify City resets and shows Mumbai, Delhi, Bangalore.

**Acceptance Scenarios**:

1. **Given** no country is selected, **When** the page loads, **Then** the City dropdown is disabled and shows "-- Select a city --".
2. **Given** "UAE" is selected as Country, **When** the user opens the City dropdown, **Then** exactly three cities appear: Dubai, Sharjah, Abu Dhabi.
3. **Given** the user selected "Dubai" as city, **When** the user changes Country to "India", **Then** the City field resets to "-- Select a city --" and shows Mumbai, Delhi, Bangalore as options.

---

### User Story 4 - Photo Upload with Preview and Validation (Priority: P3)

A user selects a photo file. If the file is a valid jpg/jpeg/png under 1 MB, a thumbnail preview and filename appear. If invalid, an error message is shown without retaining the bad file.

**Why this priority**: Photo is required but secondary to the core form flow.

**Independent Test**: Select a 500 KB PNG; verify thumbnail and filename appear. Select a 2 MB PNG; verify error "File size must not exceed 1 MB." appears and no preview is shown.

**Acceptance Scenarios**:

1. **Given** no file is selected, **When** the upload area is visible, **Then** it shows "Click to upload or drag and drop" with subtext "JPG, JPEG, PNG — max 1 MB".
2. **Given** a valid PNG file is selected, **When** client-side validation passes, **Then** a thumbnail preview, the filename, and the file size are displayed.
3. **Given** a PDF file is selected, **When** client-side validation runs, **Then** the error "Only JPG, JPEG, and PNG files are allowed." appears and no preview is shown.
4. **Given** a 2 MB PNG is selected, **When** client-side validation runs, **Then** the error "File size must not exceed 1 MB." appears and no preview is shown.

---

### Edge Cases

- What happens when the user navigates back from `/thank-you`? The form is visible but empty (no re-submission occurs).
- What happens if the server returns a 500 error on submit? The user stays on the form, all fields retain their values, and an error banner appears at the top of the form card.
- What happens when the user submits with a duplicate email? A server error banner states "An account with this email address already exists. Please use a different email."
- What happens on a very slow connection? The submit button stays disabled and shows a spinner until the server responds.
- What happens if the user drops an unsupported file type onto the upload zone? The same type-error message appears as when selecting via the file dialog.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The form page at `/` MUST display all nine required fields with correct labels, placeholders, and input types.
- **FR-002**: The form MUST validate all fields client-side before a server request is made.
- **FR-003**: Each invalid field MUST show its specific error message directly below that field element.
- **FR-004**: Error messages MUST appear on submit attempt; individual field errors SHOULD also appear on blur.
- **FR-005**: The City dropdown MUST be disabled until a Country is selected.
- **FR-006**: Selecting a Country MUST immediately populate the City dropdown with that country's cities and enable it.
- **FR-007**: Changing the Country selection MUST reset the City field to its default empty state.
- **FR-008**: The photo upload area MUST accept only jpg, jpeg, and png files and reject all others with an inline error.
- **FR-009**: The photo upload area MUST reject files larger than 1 MB with an inline error.
- **FR-010**: After a valid file is selected, the UI MUST display a thumbnail preview, the filename, and the formatted file size.
- **FR-011**: The submit button MUST be disabled and show a spinner with the text "Submitting…" while the form is being submitted.
- **FR-012**: On successful submission the user MUST be redirected to `/thank-you`.
- **FR-013**: The `/thank-you` page MUST display the submitted user's first name dynamically.
- **FR-014**: On server error the form MUST display a banner at the top of the form card without clearing any field values.
- **FR-015**: The form layout MUST be fully responsive across mobile (< 640px), tablet (640–1024px), and desktop (> 1024px) breakpoints.

### Key Entities

- **RegistrationForm**: Holds all nine field values plus validation state, submission state, and server error state.
- **CountryCityMap**: A static lookup table mapping each country name to its array of city names.
- **UploadedFile**: Represents the selected photo with name, size (bytes), type (MIME), and a local object URL for previewing.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can complete and submit the registration form in under 3 minutes on any device.
- **SC-002**: All nine validation rules are enforced and produce user-visible error messages before form data leaves the browser.
- **SC-003**: The City dropdown updates with correct options within 100 ms of a country selection with no page reload.
- **SC-004**: Photo validation (type + size) completes before the form is submitted, preventing any invalid file from reaching the server.
- **SC-005**: The form layout renders without horizontal scrolling on screens as narrow as 320 px.
- **SC-006**: On submission failure the user retains all previously entered data and can correct and re-submit without retyping.
- **SC-007**: The Thank You page displays the correct submitted name within 1 second of the successful server response.

---

## Assumptions

- No external component library; all UI is built with plain Tailwind CSS utility classes.
- Color palette: `blue-600` for primary actions, `red-500` for errors, `green-500` for success indicators, `gray-*` for neutral elements.
- Country/city data is hardcoded in `/lib/countries.ts`; no API call needed for dropdown options.
- The Thank You page receives the submitted name via URL query parameter (`?name=<encoded-name>`); the first whitespace-separated token is used as the first name.
- Form does not auto-save or persist data in `localStorage` between sessions.

---

# UI Specification Detail

## 1. Page Inventory

| Page | Route | Purpose | What user sees on arrival |
|------|-------|---------|--------------------------|
| Registration Form | `/` | Collects all user data via a single-page form | White card centered on a `bg-gray-50` background. Heading "Create Your Account" (h1). Subtitle "Please fill in all fields below to complete your registration." All nine form fields in a vertical stack. A "Submit Registration" button at the bottom. |
| Thank You | `/thank-you` | Confirms successful submission | Centered card with a large green checkmark icon, heading "Thank You, [First Name]!", body text, and a "Back to Home" link. |

---

## 2. Component Breakdown

### `RegistrationPage` (page component, `app/page.tsx`)

**Renders**: Full page shell (background, centering wrapper) containing `RegistrationForm`.  
**Props**: None (Next.js page component).  
**States**: None — delegates all state to `RegistrationForm`.

---

### `RegistrationForm` (client component, `components/RegistrationForm.tsx`)

**Renders**: The `<form>` element and all field components. Owns submission logic.  
**Props**: None.  
**States**:

| State | Type | Description |
|-------|------|-------------|
| `isSubmitting` | boolean | True while awaiting server response |
| `serverError` | string \| null | Message from a failed API call |
| react-hook-form state | internal | All field values, dirty flags, errors |

---

### `FormField` (layout wrapper, `components/FormField.tsx`)

**Renders**: A `<div>` wrapping a `<label>`, the input slot (children), and an optional error `<p>`.  
**Props**:

| Prop | Type | Description |
|------|------|-------------|
| `label` | string | Label text |
| `htmlFor` | string | Matches the input `id` |
| `error` | string \| undefined | Error message to display |
| `required` | boolean | Whether to show a red asterisk |
| `children` | ReactNode | The actual input element |

**States**: Stateless — controlled entirely by props.

---

### `TextInput` (`components/TextInput.tsx`)

**Renders**: A styled `<input>` element forwarded via `React.forwardRef`.  
**Props**: All standard HTML input attributes plus `error: boolean`.  
**States**: Default, focused (ring), error (red border).

---

### `RadioGroup` (`components/RadioGroup.tsx`)

**Renders**: A row/column of `<label><input type="radio">` pairs for Gender.  
**Props**: `options: {label: string; value: string}[]`, `value: string`, `onChange`, `error: string | undefined`.  
**States**: Default, option selected, error.

---

### `CheckboxGroup` (`components/CheckboxGroup.tsx`)

**Renders**: A grid of `<label><input type="checkbox">` pairs for Interests.  
**Props**: `options: string[]`, `value: string[]`, `onChange`, `error: string | undefined`.  
**States**: Default, individual item checked, error (group-level message).

---

### `CountrySelect` (`components/CountrySelect.tsx`)

**Renders**: A styled `<select>` for Country.  
**Props**: `value: string`, `onChange`, `error: string | undefined`.  
**States**: Default (placeholder shown), selected, error.

---

### `CitySelect` (`components/CitySelect.tsx`)

**Renders**: A styled `<select>` for City.  
**Props**: `value: string`, `onChange`, `cities: string[]`, `disabled: boolean`, `error: string | undefined`.  
**States**: Disabled (grayed out), enabled with options, selected, error.

---

### `PhotoUpload` (`components/PhotoUpload.tsx`)

**Renders**: A dashed-border upload zone with hidden `<input type="file">`, and a preview area below it.  
**Props**: `value: File | null`, `onChange`, `error: string | undefined`.  
**States**: Empty, preview-shown, error.

---

### `SubmitButton` (`components/SubmitButton.tsx`)

**Renders**: A `<button type="submit">`.  
**Props**: `isSubmitting: boolean`.  
**States**: Default (enabled), submitting (spinner + disabled).

---

### `ErrorBanner` (`components/ErrorBanner.tsx`)

**Renders**: A full-width red alert box above the form fields.  
**Props**: `message: string | null`.  
**States**: Hidden (when `message` is null), visible.

---

### `ThankYouPage` (page component, `app/thank-you/page.tsx`)

**Renders**: The full confirmation page.  
**Props**: `searchParams: { name?: string }` (Next.js page props).  
**States**: None.

---

## 3. Form Field Specifications

### 3.1 Full Name

| Attribute | Value |
|-----------|-------|
| Label text | `Full Name` |
| Required indicator | Red asterisk `*` appended after label text |
| Placeholder | `Enter your full name` |
| Input type | `text` |
| HTML attributes | `id="full_name"`, `name="full_name"`, `autoComplete="name"`, `maxLength={100}` |
| Default state | Border `border-gray-300`, background `bg-white`, text `text-gray-900`, `rounded-md` |
| Focused state | Border `border-blue-500`, ring `ring-2 ring-blue-200`, outline removed |
| Error state | Border `border-red-500`, ring `ring-2 ring-red-200`; error message in `text-red-600 text-sm` directly below input |
| Disabled state | N/A |
| Error messages | `"Full name is required."` / `"Full name must be at least 2 characters."` |

---

### 3.2 Email Address

| Attribute | Value |
|-----------|-------|
| Label text | `Email Address` |
| Required indicator | Red asterisk `*` |
| Placeholder | `Enter your email address` |
| Input type | `email` |
| HTML attributes | `id="email"`, `name="email"`, `autoComplete="email"`, `inputMode="email"` |
| Default state | Same as Full Name default |
| Focused state | Same as Full Name focused |
| Error state | Same pattern |
| Disabled state | N/A |
| Error messages | `"Email address is required."` / `"Please enter a valid email address."` |

---

### 3.3 Mobile Number

| Attribute | Value |
|-----------|-------|
| Label text | `Mobile Number` |
| Required indicator | Red asterisk `*` |
| Placeholder | `Enter your mobile number` |
| Input type | `tel` |
| HTML attributes | `id="mobile"`, `name="mobile"`, `autoComplete="tel"`, `inputMode="tel"` |
| Default state | Same as Full Name default |
| Focused state | Same as Full Name focused |
| Error state | Same pattern |
| Disabled state | N/A |
| Error messages | `"Mobile number is required."` / `"Mobile number must contain 10–15 digits only."` |

---

### 3.4 Date of Birth

| Attribute | Value |
|-----------|-------|
| Label text | `Date of Birth` |
| Required indicator | Red asterisk `*` |
| Placeholder | Native browser date placeholder (none specified) |
| Input type | `date` |
| HTML attributes | `id="date_of_birth"`, `name="date_of_birth"`, `max` set to today's ISO date string (set at render time) |
| Default state | Same as Full Name default |
| Focused state | Same as Full Name focused |
| Error state | Same pattern |
| Disabled state | N/A |
| Error messages | `"Date of birth is required."` / `"Date of birth must be a past date."` |

---

### 3.5 Gender

| Attribute | Value |
|-----------|-------|
| Label text | `Gender` |
| Required indicator | Red asterisk `*` |
| Placeholder | N/A (radio buttons) |
| Input type | `radio` |
| Options | `Male` (value `male`), `Female` (value `female`), `Other` (value `other`) |
| HTML attributes | `name="gender"`, ids: `gender-male`, `gender-female`, `gender-other` |
| Default state | No option selected; labels `text-gray-700` |
| Selected state | Selected radio shows `accent-blue-600` |
| Error state | Group-level error message in `text-red-600 text-sm` below all radio options |
| Layout | Horizontal flex row on tablet/desktop; vertical column on mobile |
| Error messages | `"Please select your gender."` |

---

### 3.6 Interests

| Attribute | Value |
|-----------|-------|
| Label text | `Interests` |
| Required indicator | Red asterisk `*` |
| Placeholder | N/A (checkboxes) |
| Input type | `checkbox` |
| Options | `Technology`, `Sports`, `Music`, `Travel`, `Reading`, `Gaming` |
| HTML attributes | `name="interests"`, ids: `interest-technology`, `interest-sports`, `interest-music`, `interest-travel`, `interest-reading`, `interest-gaming` |
| Default state | All unchecked; labels `text-gray-700` |
| Checked state | Checkbox shows `accent-blue-600` |
| Error state | Group-level error message in `text-red-600 text-sm` below all checkboxes |
| Layout | 2-column grid on mobile; 3-column grid on tablet/desktop |
| Error messages | `"Please select at least one interest."` |

---

### 3.7 Country

| Attribute | Value |
|-----------|-------|
| Label text | `Country` |
| Required indicator | Red asterisk `*` |
| Placeholder option | `-- Select a country --` (value `""`, disabled, selected by default) |
| Input type | `select` |
| HTML attributes | `id="country"`, `name="country"` |
| Options | UAE, India, Pakistan, USA, UK (in this order) |
| Default state | Placeholder shown; border `border-gray-300` |
| Focused state | Border `border-blue-500`, ring `ring-2 ring-blue-200` |
| Error state | Border `border-red-500`, ring `ring-2 ring-red-200`; error below |
| Error messages | `"Please select your country."` |

---

### 3.8 City

| Attribute | Value |
|-----------|-------|
| Label text | `City` |
| Required indicator | Red asterisk `*` |
| Placeholder option | `-- Select a city --` (value `""`, disabled, selected by default) |
| Input type | `select` |
| HTML attributes | `id="city"`, `name="city"`, `disabled` when no country selected |
| Options | Dynamic — populated from selected Country |
| Disabled state | Background `bg-gray-100`, border `border-gray-200`, text `text-gray-400`, cursor `cursor-not-allowed` |
| Enabled default state | Border `border-gray-300`, background `bg-white` |
| Focused state | Border `border-blue-500`, ring `ring-2 ring-blue-200` |
| Error state | Border `border-red-500`, ring `ring-2 ring-red-200`; error below |
| Error messages | `"Please select your city."` |

---

### 3.9 Profile Photo

| Attribute | Value |
|-----------|-------|
| Label text | `Profile Photo` |
| Required indicator | Red asterisk `*` |
| Upload zone primary copy | `Click to upload or drag and drop` |
| Upload zone subtext | `JPG, JPEG, PNG — max 1 MB` |
| Input type | `file` (hidden `<input>`, triggered by clicking the zone) |
| HTML attributes | `id="photo"`, `name="photo"`, `accept=".jpg,.jpeg,.png"` |
| Default state | Border `border-2 border-dashed border-gray-300`, `rounded-lg`, background `bg-gray-50`, centered upload icon + text |
| Hover state | Border `border-blue-400`, background `bg-blue-50` |
| Error state | Border `border-2 border-solid border-red-500`, background `bg-red-50`; error in `text-red-600 text-sm` below zone |
| Preview state | Upload zone shows border `border-green-400 border-solid`, background `bg-green-50`; thumbnail (80×80 px, `object-cover rounded-md`), filename, and formatted size appear below |
| Error messages | `"Please upload a profile photo."` / `"Only JPG, JPEG, and PNG files are allowed."` / `"File size must not exceed 1 MB."` |

---

## 4. Dependent Dropdown Behavior

### 4.1 On Page First Load

- Country dropdown renders with `-- Select a country --` selected.
- City dropdown renders with `-- Select a city --` selected.
- City dropdown has the `disabled` HTML attribute applied.
- City visual state: background `bg-gray-100`, border `border-gray-200`, text `text-gray-400`, cursor `cursor-not-allowed`.
- No city options other than the placeholder exist in the DOM.

### 4.2 When User Selects a Country

1. The `onChange` handler on Country fires with the selected value (e.g., `"UAE"`).
2. `CountryCityMap` is looked up synchronously (no async call, no spinner).
3. City dropdown `disabled` attribute is removed.
4. City visual state transitions to enabled: background `bg-white`, border `border-gray-300`, text `text-gray-900`.
5. City options for the selected country are rendered (e.g., Dubai, Sharjah, Abu Dhabi for UAE).
6. City field value is set to `""` (placeholder shown).
7. Any existing city validation error is cleared.

### 4.3 When User Changes Country After Already Selecting a City

1. Country `onChange` fires with the new value.
2. Current city value resets to `""`.
3. Old city options are removed from the DOM.
4. New city options for the new country are injected.
5. City dropdown remains enabled.
6. Any previous city validation error is cleared.

### 4.4 When User Selects the Country Placeholder (Clears Selection)

1. City field value resets to `""`.
2. City dropdown `disabled` attribute is reapplied.
3. City visual state returns to disabled appearance.
4. All city options except the placeholder are removed from the DOM.

---

## 5. File Upload Behavior

### 5.1 Before Any File Is Selected (Default State)

- Upload zone shows: SVG upload icon (centered, `text-gray-400`, 40×40 px).
- Primary text: `"Click to upload or drag and drop"` — `text-sm font-medium text-gray-700`.
- Secondary text: `"JPG, JPEG, PNG — max 1 MB"` — `text-xs text-gray-500`.
- Clicking anywhere in the zone triggers the hidden `<input type="file">`.
- Zone supports drag-and-drop: `dragover` and `dragleave` events toggle the hover visual state.

### 5.2 While File Is Being Validated (Client-Side)

- Validation is synchronous (extension check + size check in JavaScript).
- No intermediate loading state — the result renders immediately on the next render cycle.

### 5.3 After a Valid File Is Selected

- Upload zone border: `border-green-400 border-solid`, background `bg-green-50`.
- Below the zone, a preview section appears:
  - Thumbnail: `<img>` sourced from `URL.createObjectURL(file)` — 80×80 px, `object-cover`, `rounded-md`.
  - Filename: `text-sm text-gray-800 font-medium`, truncated with `truncate max-w-xs` if longer than 40 characters.
  - File size: formatted as "X KB" (if < 1024 KB) — `text-xs text-gray-500`.
  - "Remove" link: `text-red-500 text-sm underline cursor-pointer`; clicking clears the file and returns the zone to default state.

### 5.4 When Wrong File Type Is Selected

- File is rejected; no thumbnail or preview shown.
- Upload zone border: `border-red-500 border-solid`, background `bg-red-50`.
- Error message below zone: `"Only JPG, JPEG, and PNG files are allowed."` — `text-red-600 text-sm`.

### 5.5 When File Is Too Large

- File is rejected; no thumbnail or preview shown.
- Upload zone border: `border-red-500 border-solid`, background `bg-red-50`.
- Error message below zone: `"File size must not exceed 1 MB."` — `text-red-600 text-sm`.

### 5.6 While Form Is Submitting

- Upload zone becomes non-interactive: `pointer-events-none opacity-60`.
- Previously shown preview remains visible.
- Hidden file input receives `disabled` attribute.

---

## 6. Form States

### 6.1 Initial / Empty State

- All text inputs show placeholder text in `text-gray-400`.
- No radio option selected for Gender.
- No checkboxes checked for Interests.
- Country shows `-- Select a country --`.
- City shows `-- Select a city --` and is disabled.
- Photo upload zone shows default state (icon + copy).
- No error messages visible anywhere.
- Submit button enabled, text `"Submit Registration"`, `bg-blue-600 text-white`.

### 6.2 Partially Filled State

- Filled inputs show user content in `text-gray-900`.
- Unfilled inputs retain placeholder appearance.
- No errors shown unless the user has blurred a field that fails validation.
- On blur after a field fails validation, the field's error message appears directly below it.

### 6.3 Validation Error State

**Trigger**: User clicks Submit with one or more invalid fields.

- Form does NOT submit to the server.
- All invalid fields show error borders (`border-red-500`) simultaneously.
- Error messages (`text-red-600 text-sm`) appear below each invalid field.
- Page scrolls to the first invalid field.
- Valid fields retain their values and show no error.
- Submit button returns to its default enabled state.

### 6.4 Submitting State

**Trigger**: All client-side validation passes; user clicks Submit.

- Submit button: disabled, shows SVG spinner (`animate-spin`, white, 16×16 px) + text `"Submitting…"`, styled `bg-blue-400 cursor-not-allowed`.
- All form fields: `pointer-events-none` (visually unchanged but non-interactive).
- No error messages shown.

### 6.5 Submit Success

**Trigger**: Server returns 200 OK.

- `router.push('/thank-you?name=<encodeURIComponent(submittedFullName)>')` called immediately.
- Form page unmounts; no further state changes.

### 6.6 Submit Failure / Server Error

**Trigger**: Server returns 4xx/5xx or network fails.

- Submitting state ends; submit button returns to default enabled state.
- `pointer-events-none` removed from all fields.
- `ErrorBanner` appears at the top of the form card (above all fields, below the heading/subtitle):
  - Duplicate email (409): `"An account with this email address already exists. Please use a different email."`
  - Any other error: `"Something went wrong. Please try again in a moment."`
- Banner: `bg-red-50 border border-red-200 rounded-md p-4 mb-6`, text `text-red-700 text-sm`.
- Banner dismisses on next `onChange` event on any field.
- All field values are preserved.

---

## 7. Thank You Page

**Route**: `/thank-you`  
**Data source**: `searchParams.name` (URL query parameter, URL-decoded).

### Heading

`"Thank You, [First Name]!"`

- `[First Name]` is the first whitespace-separated token of the URL-decoded `name` parameter.
- Fallback (if `name` is absent or empty): `"Thank You!"`
- Styled: `text-3xl font-bold text-gray-900 text-center mt-4`

### Body Text

`"Your registration has been received. We'll be in touch shortly."`

- Styled: `text-gray-600 text-center mt-2`

### Layout

- Page background: `bg-gray-50`.
- Centered card: `max-w-md mx-auto mt-20 p-10 bg-white rounded-2xl shadow-lg text-center`.
- At the top of the card: SVG checkmark circle icon (64×64 px, `text-green-500 mx-auto`).
- Below icon: `<h1>` heading.
- Below heading: body paragraph.
- Below paragraph: CTA link.

### CTA

- Text: `"Back to Home"`
- Element: Next.js `<Link href="/">` styled as a button.
- Appearance: `inline-block mt-6 px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors`.

---

## 8. Responsive Behavior

### 8.1 Mobile (< 640px)

- Page background: `bg-gray-50`.
- Form card: full-width minus horizontal margin `mx-4`, `rounded-xl shadow-sm`, `p-6`.
- All form fields: full-width, stacked vertically, `mb-5` gap between fields.
- Gender radio buttons: vertical column (`flex flex-col gap-2`).
- Interests checkboxes: 2-column grid (`grid grid-cols-2 gap-3`).
- Country and City selects: full-width, stacked (City below Country).
- Photo upload zone: full-width.
- Submit button: full-width (`w-full`).
- Page heading: `text-2xl font-bold text-gray-900 text-center`.
- Subtitle: `text-sm text-gray-600 text-center mb-6`.

### 8.2 Tablet (640px–1024px)

- Form card: `max-w-xl mx-auto`, `p-8`, `rounded-2xl shadow-md`.
- All form fields: full-width within the card.
- Gender radio buttons: horizontal row (`flex flex-row gap-6`).
- Interests checkboxes: 3-column grid (`grid grid-cols-3 gap-3`).
- Country and City selects: side-by-side (`grid grid-cols-2 gap-4`).
- Submit button: full-width.
- Page heading: `text-3xl`.

### 8.3 Desktop (> 1024px)

- Form card: `max-w-2xl mx-auto`, `p-10`, `rounded-2xl shadow-lg`.
- All form fields: full-width within the card.
- Gender radio buttons: horizontal row (same as tablet).
- Interests checkboxes: 3-column grid (same as tablet).
- Country and City selects: side-by-side 2-column grid (same as tablet).
- Submit button: right-aligned (`flex justify-end`), auto width with `px-8` horizontal padding.
- Page heading: `text-4xl`.

---

## 9. Loading & Error States

### 9.1 Submit Button During Submission

| Property | Value |
|----------|-------|
| Text | `"Submitting…"` |
| Left icon | SVG spinner (`animate-spin`, white, 16×16 px, `mr-2`) |
| Background | `bg-blue-400` (lighter than default `bg-blue-600`) |
| Cursor | `cursor-not-allowed` |
| Disabled | `disabled` HTML attribute present |
| Width | Full-width on mobile; auto on desktop |

### 9.2 How Server Errors Are Displayed

- Method: inline `ErrorBanner` at the top of the form card — not a toast, not a modal.
- Position: inside the card, below the heading/subtitle, above the first field.
- Appearance: `bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-start gap-3`, with a warning SVG icon (`text-red-400`) and text `text-red-700 text-sm`.
- Dismissal: banner disappears on the next `onChange` event on any field.
- Persistence: banner stays until the user modifies a field or a new submission succeeds.

### 9.3 Field Values on Error

- On client-side validation failure: all field values are fully preserved; no fields are cleared.
- On server-side error: all field values are fully preserved; no fields are cleared.
- The Photo field's preview remains visible and the file reference is preserved.
- The user corrects only the relevant field and resubmits without retyping everything.
