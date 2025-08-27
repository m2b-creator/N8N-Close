# n8n-nodes-close-crm

![n8n.io - Workflow Automation](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png)

This is an n8n community node that lets you use Close CRM in your n8n workflows.

Close CRM is a sales CRM built for high-growth companies that need to scale their sales operations.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[![npm version](https://badge.fury.io/js/n8n-nodes-close-crm.svg)](https://www.npmjs.com/package/n8n-nodes-close-crm)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)

## Installation

### Option 1: Install via n8n Community Nodes (Recommended)

1. Go to **Settings > Community Nodes** in your n8n instance
2. Select **Install**
3. Enter `n8n-nodes-close-crm` as the package name
4. Agree to the risks of using community nodes
5. Select **Install**

After installation is complete, the Close CRM node will be available in your node palette.

### Option 2: Manual Installation

If you're running n8n with npm:

```bash
# Navigate to your n8n installation directory
cd ~/.n8n/nodes

# Install the package
npm install n8n-nodes-close-crm
```

### Option 3: Docker

If you're using n8n with Docker, add the package to your docker-compose.yml:

```yaml
environment:
  - N8N_COMMUNITY_PACKAGES=n8n-nodes-close-crm
```

Or install it in your running container:

```bash
docker exec -it n8n npm install n8n-nodes-close-crm
```

## Operations

### Actions (Close CRM Node)

**Lead**

- Create: Create new leads with contacts and custom fields
- Delete: Delete existing leads
- Find: Search for leads using queries, SmartViews, or status filters
- Merge: Merge two leads into one
- Update: Update lead information including custom fields

**Opportunity**

- Create: Create new opportunities for leads
- Delete: Delete existing opportunities
- Find: Search for opportunities by lead or status
- Update: Update opportunity details including status, value, and notes

**Task**

- Create: Create new tasks for leads

**Note**

- Create: Create note activities (plain text or rich HTML)
- Delete: Delete note activities
- Find: Search for note activities with advanced filtering
- Get: Fetch a single note activity
- Update: Update note activities (plain text or HTML content)

**Call**

- Create: Log call activities manually (for calls made outside Close VoIP)
- Delete: Delete call activities
- Find: Search for call activities
- Get: Fetch a single call activity
- Update: Update call activities including notes and outcomes

**Email**

- Create: Create email activities (draft, send, schedule, or log)
- Delete: Delete email activities
- Find: Search for email activities
- Get: Fetch a single email activity
- Update: Update email activities (modify drafts or change status)

**Meeting**

- Delete: Delete meeting activities
- Find: Search for meeting activities with advanced filtering
- Get: Fetch a single meeting activity (with optional transcripts)
- Update: Update meeting activities including notes and outcomes

**SMS**

- Create: Create SMS activities (draft, send, schedule, or log)
- Delete: Delete SMS activities
- Find: Search for SMS activities with advanced filtering
- Get: Fetch a single SMS activity (including MMS attachments)
- Update: Update SMS activities (modify drafts or change status)

**Task**

- Bulk Update: Bulk-update multiple tasks with filtering
- Create: Create tasks for leads with date and assignment
- Delete: Delete task activities
- Find: Search for tasks with advanced filtering (by type, lead, view, etc.)
- Get: Fetch a single task activity
- Update: Update task details including completion status

**Custom Activity**

- Get Published: Retrieve published custom activities

### Triggers (Close CRM Trigger Node)

**Polling Triggers**

- Published Custom Activity: Triggers when new custom activities are published
- New Lead in SmartView: Triggers when leads are added to a specific SmartView
- New Lead in Status: Triggers when leads are created with a specific status

## Credentials

This node uses API key authentication. You'll need to:

1. Get your Close CRM API key from your Close account settings
2. Create new credentials in n8n using the "Close API" credential type
3. Enter your API key

## Compatibility

- Minimum n8n version: 0.200.0
- Node.js version: 18.10 or higher

## Usage

### Basic Lead Search

```
Resource: Lead
Operation: Find
Query: "company:acme"
```

### Update Lead with Custom Fields

```
Resource: Lead
Operation: Update
Lead ID: lead_abc123
Custom Fields:
  - Field ID: cf_custom123
  - Field Value: "Updated Value"
```

### Create Opportunity

```
Resource: Opportunity
Operation: Create
Lead ID: lead_abc123
Additional Fields:
  - Status ID: stat_qualified
  - Note: "Hot prospect from website"
  - Value: 50000 (in cents = $500.00)
```

### Delete Opportunity

```
Resource: Opportunity
Operation: Delete
Opportunity ID: oppo_xyz789
```

### Create Call

```
Resource: Call
Operation: Create
Lead ID: lead_abc123
Additional Fields:
  - Direction: outbound
  - Duration: 300 (seconds)
  - Note (HTML): "<p>Great conversation about pricing</p>"
  - Phone: "+1234567890"
```

### Create Email

```
Resource: Email
Operation: Create
Lead ID: lead_abc123
To: "contact@example.com"
Subject: "Follow-up on our conversation"
Status: outbox
Additional Fields:
  - Body (HTML): "<p>Thank you for your time today...</p>"
  - CC: "manager@company.com"
  - Sender: '"John Doe" <john@company.com>'
```

### Update Email Draft

```
Resource: Email
Operation: Update
Email ID: acti_email123
Update Fields:
  - Subject: "Updated: Follow-up on our conversation"
  - Body (HTML): "<p>Updated content...</p>"
  - Status: outbox
```

### Get Meeting with Transcripts

```
Resource: Meeting
Operation: Get
Meeting ID: acti_meeting123
Additional Options:
  - Include Transcripts: true
```

### Update Meeting Notes

```
Resource: Meeting
Operation: Update
Meeting ID: acti_meeting123
Update Fields:
  - User Note (HTML): "<p>Excellent meeting! Lead is very interested in our premium package.</p>"
  - Outcome ID: "outcome_qualified"
```

### Find Recent Meetings

```
Resource: Meeting
Operation: Find
Lead ID: lead_abc123
Additional Filters:
  - Date Created After: 2024-01-01T00:00:00Z
  - Date Created Before: 2024-12-31T23:59:59Z
```

### Create Note (HTML)

```
Resource: Note
Operation: Create
Lead ID: lead_abc123
Note Content Type: HTML (Rich Text)
Note (HTML): "<p>Discussed <strong>pricing options</strong> and <em>implementation timeline</em>.</p>"
```

### Create Note (Plain Text)

```
Resource: Note
Operation: Create
Lead ID: lead_abc123
Note Content Type: Plain Text
Note (Plain Text): "Customer showed strong interest in premium features. Follow up next week."
```

### Update Note

```
Resource: Note
Operation: Update
Note ID: acti_note123
Update Content Type: HTML (Rich Text)
Note (HTML): "<p>Updated: Customer confirmed budget of <strong>$50,000</strong> for Q1 implementation.</p>"
```

### Find Notes by Lead

```
Resource: Note
Operation: Find
Lead ID: lead_abc123
Additional Filters:
  - Date Created After: 2024-01-01T00:00:00Z
```

### Create SMS

```
Resource: SMS
Operation: Create
Lead ID: lead_abc123
To Phone: "+1234567890"
Local Phone: "+0987654321"
Status: outbox
Text: "Hi! Thanks for your interest. Let's schedule a call to discuss your needs."
```

### Schedule SMS

```
Resource: SMS
Operation: Create
Lead ID: lead_abc123
To Phone: "+1234567890"
Local Phone: "+0987654321"
Status: scheduled
Text: "Reminder: Your demo call is tomorrow at 2 PM EST."
Additional Fields:
  - Date Scheduled: 2024-01-15T19:00:00Z
  - Direction: outbound
```

### Update SMS Draft

```
Resource: SMS
Operation: Update
SMS ID: acti_sms123
Update Fields:
  - Text: "Updated: Thanks for your interest! When would be a good time for a quick call?"
  - Status: outbox
```

### Create Task

```
Resource: Task
Operation: Create
Lead ID: lead_abc123
Text: "Follow up with customer"
Date: 2024-01-15T10:00:00Z
Assigned To: user_456
```

### Find Tasks by Type

```
Resource: Task
Operation: Find
Task Type: all
View: inbox
Additional Filters:
  - Assigned To: user_123
  - Order By: -date
```

### Bulk Update Tasks

```
Resource: Task
Operation: Bulk Update
Filter Tasks:
  - Lead ID: lead_abc123
  - Is Complete: false
Update Data:
  - Assigned To: user_789
  - Is Complete: true
```

### Update Task Status

```
Resource: Task
Operation: Update
Task ID: task_xyz789
Update Fields:
  - Is Complete: true
  - Text: "Customer contacted - follow up completed"
```

### Trigger on New Leads in SmartView

```
Event: New Lead in SmartView
Smart View: "Hot Prospects"
```

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Close CRM API Documentation](https://developer.close.com/)
- [Close CRM](https://close.com/)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

If you encounter any issues or have questions:

1. Check the [GitHub Issues](https://github.com/m2b-creator/N8N-Close/issues) page
2. Create a new issue if your problem isn't already reported
3. Include detailed information about your setup and the issue

## Version History

### 1.0.23 (Latest)

- **NEW**: Complete Task management with full CRUD operations
- Task operations: Create, Delete, Get, Update, Find, Bulk Update
- Support for all task types (lead, missed call, email follow-up, etc.)
- Advanced task filtering with view support (inbox, future, archive)
- Bulk update operations for efficient task management
- Date range and completion status filtering
- Compatible with existing task structure while adding new capabilities
- Comprehensive test coverage for all operations (122 total tests)
- Updated documentation with practical task management examples

### 1.0.22

- **NEW**: Complete SMS Activity management (Create, Delete, Get, Update, Find)
- Support for SMS drafts, scheduling, sending, and logging
- MMS attachment support with media handling
- SMS template integration with server-side rendering
- Advanced SMS filtering by lead, user, and date ranges
- Send-to-inbox functionality for received SMS
- Updated documentation with practical SMS examples

### 1.0.21

- **NEW**: Complete Note Activity management (Create, Delete, Get, Update, Find)
- Support for both plain text and rich HTML content in notes
- Advanced note filtering by lead, user, and date ranges
- HTML/Plain text content type switching with proper API handling
- Updated documentation with practical examples for all note operations

### 1.0.20

- **NEW**: Complete Meeting Activity management (Delete, Get, Update, Find)
- Support for meeting transcripts via Close Notetaker integration
- Advanced meeting filtering by lead, user, and date ranges
- Meeting notes and custom outcome support
- Full support for Close CRM Activity API endpoints as documented at [developer.close.com](https://developer.close.com/resources/activities/)
- Updated documentation with practical examples

### 1.0.19

- **NEW**: Complete Call Activity management (Create, Delete, Get, Update, Find)
- **NEW**: Complete Email Activity management (Create, Delete, Get, Update, Find)
- Rich email functionality including drafts, scheduling, sending, and templates
- Call logging with recording URLs, notes, and custom outcomes
- Updated documentation with practical examples

### 1.0.18

- **NEW**: Create and Delete operations for Opportunities
- Enhanced Opportunity management capabilities
- Comprehensive test coverage for all Opportunity operations
- Updated documentation with examples for new operations

### 1.0.0

- Initial release
- Support for Lead, Opportunity, Task, Note, Call, and Custom Activity operations
- Polling triggers for SmartViews, Status changes, and Custom Activities
- Dynamic custom field support
- Full Close CRM API integration
- Comprehensive error handling and validation
- TypeScript implementation with full type safety

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [n8n](https://n8n.io/) for the amazing workflow automation platform
- [Close CRM](https://close.com/) for their comprehensive API
- The n8n community for their support and contributions
