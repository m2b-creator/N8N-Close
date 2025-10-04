# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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