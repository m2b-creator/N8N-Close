# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.8.0] - 2026-08-26

### Added
- **API Only (Hidden) custom field support** — Lead, Opportunity, Contact, and Custom Activity create/update operations now expose an **API Only Field** custom field group, matching Close's `hidden` field type ("This field can only be set through the API" in the Close UI). These fields are never shown in the Close UI but are fully readable/writable through this node. Also available on the nested contact fields when creating or updating a Lead.

### Technical
- Added `getApiOnlyFields`, `getContactApiOnlyFields`, and `getCustomActivityApiOnlyFields` load-options methods, plus payload construction and (non-restrictive) validation for the `hidden` field type.
- All 197 tests green across 5 suites. All checks green: `tsc --noEmit`, `eslint`, `jest`.

## [1.7.1] - 2026-07-10

### Fixed
- **Lead/Contact custom fields not refreshing on credential change** — custom field option lists (Choice, User, Contact) on Lead and Contact resources now correctly reload when the Close CRM credential is switched, by adding `loadOptionsDependsOn: ['credentials']` to the affected properties (closes #22).

### Technical
- Bumped dev dependencies: `@types/node` ^26.1.1, `@typescript-eslint/eslint-plugin` ^8.63.0, `@typescript-eslint/parser` ^8.63.0, `eslint` ^10.6.0, `eslint-plugin-n8n-nodes-base` ^1.16.7, `@swc/core` ^1.15.43, `prettier` ^3.9.5.
- Evaluated bumping `typescript` to ^7.0.2 but reverted — `@typescript-eslint` 8.x peer-caps at `typescript<6.1.0`, so TS7 isn't compatible yet; stayed on `typescript` ^6.0.3.

## [1.7.0] - 2026-06-04

### Added
- **User attribution** (`user_id`) field on Lead create/update, Contact create/update, Note create/update, Call create/update, Email create/update, SMS create/update, and Custom Activity create/update — lets you post activities on behalf of a specific team member (closes #19).
- **Date Created** (`date_created`) override on Note create, Custom Activity create, Call create, Email create, and SMS create — allows back-dating activities to the exact time an event occurred (closes #20).
- **Missing contact type options** — email type now includes `Direct`, `Mobile`, `Home`, `Fax`, and `URL`; phone type now includes `Direct` and `URL`, matching all types available in Close CRM (closes #17).
- **Add / Remove action for multi-value custom fields** — Choice (Multiple), User (Multiple), and Contact (Multiple) custom fields now expose an **Action** selector (Replace / Add / Remove, default: Replace). Selecting Add or Remove appends `.add` / `.remove` to the API key (e.g. `custom.cf_xxx.add`), enabling single-value mutations without a prior Get (closes #18).

### Changed
- Replaced `ts-jest` with `@swc/jest` for test compilation — compatible with Jest 30.4.x and significantly faster.

### Technical
- Bumped all dev dependencies to latest: `@types/node` ^25.9.1, `eslint` ^10.4.1, `typescript` ^6.0.3, `jest` ^30.4.2, `@swc/core` ^1.15.40, `@swc/jest` ^0.2.39, `pnpm` 11.5.1, `@portabletext/to-html` ^5.0.2.
- Added `types: ['jest', 'node']` to jest transform config for TypeScript 6 compatibility.
- All 194 tests green across 4 suites.

## [1.6.4] - 2026-04-30

### Added
- New "Automation & Bulk Actions" resources on the Close CRM node:
  - **Sequence**: list, get, create, update, delete sequences; subscribe a contact, get / update / list sequence subscriptions (e.g. pause/resume).
  - **Bulk Action**: create / list / get for bulk Email, bulk Edit (set lead status, set/clear custom field), bulk Delete, and bulk Sequence Subscription (subscribe / pause / resume / resume_finished).
  - **Export**: start lead exports, start opportunity exports, list exports, fetch a single export to poll `status` and retrieve `download_url`.
  - **Field Enrichment**: AI-enrich a custom field on a lead or contact via `POST /enrich_field/`.
- JSON-typed inputs for `s_query`, `schedule`, `steps`, `params`, and `sort` so the full Close advanced filtering / scheduling capability is reachable from n8n.
- Safety check: bulk delete now requires an `s_query` to avoid accidentally targeting all leads.

### Technical
- Added `parseJsonParam` helper to validate JSON inputs with clear error messages.
- 28 new unit tests covering the new endpoints and edge cases (pause/subscribe action types, missing required fields, invalid JSON, list pagination); test count is now 194 across 4 suites.
- All checks green: `tsc --noEmit`, `eslint`, `jest`, `npm run build`.

## [1.6.3] - 2026-04-24

### Fixed
- Close Trigger activation no longer wedges with `Duplicate active subscription` after Docker container or n8n server restarts; webhooks on Close are cleaned up automatically and the webhook is recreated on retry.
- Close Trigger deactivation now always clears local webhook state, even if Close rejects the `DELETE` call, so the next activation starts from a clean slate.

### Technical
- Hardened the webhook lifecycle so lost local state, manually deleted webhooks on Close, or `N8N_WEBHOOK_URL` changes recover automatically on the next activation cycle.

## [1.6.2] - 2026-04-23

### Changed
- **#14**: Close CRM webhooks now compare the stored webhook URL with the current n8n webhook URL before reuse, recreate automatically on mismatch, and reactivate paused webhooks in place.

### Technical
- Preserved webhook ID and signature key when reactivating paused webhooks via `PUT`.

## [1.6.1] - 2026-04-18

### Fixed
- **#12**: Close CRM now discards `null`/`undefined` values from lead and contact create/update payloads before sending requests.
- Prevented API validation errors when optional contact fields such as email or phone are intentionally left blank.
- Applied the same nullish cleanup to related contact/address bodies to keep payload handling consistent.

### Changed
- Extended request-body sanitization across the Close node's lead and contact create/update flows.
- Added regression coverage for null contact fields in the test suite.

### Technical
- Introduced a small internal helper to strip nullish values from request payloads.
- Verified the Close node test suite after the payload cleanup changes.

## [1.6.0] - 2026-04-17

### Fixed
- **#7**: Fixed an edge-case failure in workflow execution that could cause unstable behavior with specific Close CRM payloads.
- **#8**: Resolved a follow-up regression that led to inconsistent results in certain node operation scenarios.

### Changed
- Improved operation flow to provide more predictable execution across varying real-world payload structures.
- Applied backward-compatible reliability improvements for node behavior and run consistency.

### Technical
- Added explicit issue traceability for this release (`#7`, `#8`).
- Completed minor internal maintenance and release housekeeping for npm publication (`1.6.0`).

## [1.5.0] - 2025-10-23

### Added
- **Contact Resource**: Implemented full CRUD operations for contacts
  - **Create**: Create new contacts with name, title, emails, phones, URLs, and custom fields
  - **List**: Search and list contacts with filtering by lead ID or search query
  - **Get**: Fetch a single contact by ID with complete details
  - **Update**: Update contact information including all fields and custom fields
  - **Delete**: Remove contacts (already existed, now part of complete resource)
- **Contact Custom Fields**: Complete custom field support for contact operations
  - Text, number, date/datetime fields
  - Single and multiple choice fields
  - Single and multiple user fields
  - Full integration with existing custom field load methods
- **Contact Filtering**: Advanced filtering capabilities for listing contacts
  - Filter by lead ID
  - Search by query string
  - Pagination support (Return All or limit results)

### Changed
- **Contact Operations**: Expanded from single delete operation to full CRUD resource
- **Contact Description**: Updated operation definitions and field descriptions
- **Tests**: Updated test suite to validate all 5 contact operations

### Technical
- Enhanced `ContactDescription.ts` with comprehensive field definitions
- Implemented contact operations in `Close.node.ts` following existing patterns
- Added custom field support using existing `constructContactCustomFieldsPayload` utility
- All operations follow Close CRM API specifications from developer.close.com

## [1.4.0] - 2025-10-23

### Added
- **Lead Update**: Enhanced contact handling to preserve existing contacts on update operations
- **Lead Update**: Added contacts and address fields to lead update functionality
- **HTML to Portable Text**: Implemented HTML parsing to Portable Text format conversion
- **Meeting Filters**: Added activity_at filters for meetings
- **Opportunity Filtering**: Added statusType parameter for enhanced opportunity filtering

### Changed
- **Date Filters**: Updated display names for date filters in Meeting, Note, SMS, and Task operations for improved clarity
- **User Notes**: Changed user note field from plain text to user_note_html format
- **User Notes**: Enhanced user note handling to convert plain text to Portable Text format

### Technical
- Updated package dependencies to latest versions
- Enhanced PNPM package manager configuration

## [1.3.0] - 2024-12-15

### Added
- **Custom Fields**: Implemented Portable Text conversion for rich text custom fields
- **Custom Activity**: Added status field for custom activities
- **Custom Fields**: Comprehensive support for custom activity rich text fields
- **Custom Fields**: Enhanced compatibility for multiple value fields
- **Custom Fields**: Added HTML formatting for rich text fields

### Changed
- **Custom Fields**: Improved HTML wrapping for rich text fields

### Removed
- **Custom Fields**: Removed unused updateFields section for cleaner code organization

### Technical
- Improved code quality with syntax fixes and linting updates

## [1.2.0] - 2025-10-04

### Fixed
- **CloseTrigger**: Improved webhook signature verification by enhancing raw body handling for Close CRM webhooks
  - Added robust fallback mechanism for raw body extraction (Buffer/string support)
  - Ensures accurate signature validation across different n8n configurations
  - Prevents signature verification failures due to body parsing inconsistencies

### Added
- **Opportunity Find Operation**: Added opportunityId parameter for direct opportunity lookup by ID

### Documentation
- Updated README.md to reflect new Opportunity Find operation with ID-based lookup
- Enhanced webhook trigger documentation to highlight secure signature verification
- Improved usage examples with direct opportunity ID lookup demonstration

## [1.0.0] - 2024-01-31

### Added
- Initial release of n8n-nodes-close-crm
- Close CRM API integration with comprehensive functionality

#### Triggers (Polling)
- **Published Custom Activity**: Triggers when new custom activities are published
- **New Lead in SmartView**: Triggers when leads are added to specific SmartViews
- **New Lead in Status**: Triggers when leads are created with specific statuses

#### Actions
- **Find Lead**: Search for leads using queries, SmartViews, or status filters
- **Update Lead**: Update lead information including dynamic custom fields support
- **Create Task**: Create new tasks for leads with date and assignment options
- **Find Opportunity**: Search for opportunities by lead or status
- **Update Opportunity**: Update opportunity details including status and value
- **Create Note**: Create notes for leads
- **Find Call**: Search for call activities

#### Features
- **Authentication**: Secure API key-based authentication with Close CRM
- **Dynamic Custom Fields**: Full support for updating leads with custom fields
- **Error Handling**: Comprehensive error handling with meaningful user messages
- **Input Validation**: Proper validation for all required parameters
- **TypeScript**: Fully typed implementation for better development experience
- **Polling**: Efficient polling mechanism for trigger operations
- **Pagination**: Support for handling large datasets with pagination

#### Technical
- Compatible with n8n version 0.200.0 and higher
- Node.js 18.10+ support
- Comprehensive test coverage
- ESLint and Prettier configuration
- Apache 2.0 license

### Dependencies
- n8n-workflow as peer dependency
- Full TypeScript support
- Jest for testing
- ESLint for code quality