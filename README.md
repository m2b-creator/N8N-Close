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
[Version History](#version-history)  
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

- **Create**: Create new leads with enhanced contact details (office & mobile phone), complete address information, and custom fields
- **Delete**: Delete existing leads
- **Find**: Find specific leads by Lead ID (direct lookup for detailed lead information)
- **Merge**: Merge two leads into one
- **Update**: Update lead information including URL field and custom fields with dropdown support

**Lead Status**

- **Create**: Create new lead statuses (active, won, lost)
- **Delete**: Delete lead statuses (ensure no leads use this status first)
- **List**: List all lead statuses for your organization
- **Update**: Rename and modify lead statuses

**Opportunity**

- **Create**: Create new opportunities with enhanced fields (assigned user, confidence, value period, close date)
- **Delete**: Delete existing opportunities
- **Find**: Search for opportunities with advanced filtering (assigned user, confidence, value period, close date)
- **Update**: Update opportunity details including status, value, and notes

**Opportunity Status**

- **Create**: Create new opportunity statuses (active, won, lost) with pipeline support
- **Delete**: Delete opportunity statuses (ensure no opportunities use this status first)
- **List**: List all opportunity statuses for your organization
- **Update**: Rename and modify opportunity statuses with pipeline management

**Task**

- **Bulk Update**: Bulk-update multiple tasks with filtering
- **Create**: Create tasks with Close user assignment dropdown
- **Delete**: Delete task activities
- **Find**: Search for tasks with advanced filtering (by type, lead, view, etc.)
- **Get**: Fetch a single task activity
- **Update**: Update task details including completion status

**Note**

- **Create**: Create note activities (plain text or rich HTML)
- **Delete**: Delete note activities
- **Find**: Search for note activities with advanced filtering
- **Get**: Fetch a single note activity
- **Update**: Update note activities (plain text or HTML content)

**Call**

- **Create**: Log call activities manually (for calls made outside Close VoIP)
- **Delete**: Delete call activities
- **Find**: Search for call activities
- **Get**: Fetch a single call activity
- **Update**: Update call activities including notes and outcomes

**Email**

- **Create**: Create email activities (draft, send, schedule, or log)
- **Delete**: Delete email activities
- **Find**: Search for email activities
- **Get**: Fetch a single email activity
- **Update**: Update email activities (modify drafts or change status)

**Meeting**

- **Delete**: Delete meeting activities
- **Find**: Search for meeting activities with advanced filtering
- **Get**: Fetch a single meeting activity (with optional transcripts)
- **Update**: Update meeting activities including notes and outcomes

**SMS**

- **Create**: Create SMS activities (draft, send, schedule, or log)
- **Delete**: Delete SMS activities
- **Find**: Search for SMS activities with advanced filtering
- **Get**: Fetch a single SMS activity (including MMS attachments)
- **Update**: Update SMS activities (modify drafts or change status)

**Custom Activity**

- **Find**: Search custom activities by Lead ID, Custom Activity ID, or date filters (enhanced from "Get Published")

### Triggers (Close CRM Trigger Node)

**Polling Triggers**

- **New Lead in SmartView**: Triggers when leads are added to a specific SmartView
- **New Lead in Status**: Triggers when leads are created with a specific status
- **Opportunity in new Status**: ✨ **NEW** - Triggers when opportunities enter a new status (with optional status filtering)
- **New Task**: ✨ **NEW** - Triggers when tasks are created or completed (with task type filtering)
- **Published Custom Activity**: Triggers when custom activities are published (now includes custom activity name)

## Credentials

This node uses API key authentication. You'll need to:

1. Get your Close CRM API key from your Close account settings
2. Create new credentials in n8n using the "Close API" credential type
3. Enter your API key

## Compatibility

- Minimum n8n version: 0.200.0
- Node.js version: 18.10 or higher

## Usage

### Enhanced Lead Creation

```
Resource: Lead
Operation: Create
Name: "Acme Corporation"
Additional Fields:
  - Description: "B2B SaaS company"
  - URL: "https://acme.com"
  - Status: "Qualified"
Contacts:
  - Contact Name: "John Smith"
  - Contact Office Email: "john@acme.com" 
  - Contact Office Phone: "+1-555-0123"
  - Contact Mobile Phone: "+1-555-0124"
Address:
  - Address Street: "123 Main St"
  - Address City: "San Francisco"
  - Address State: "CA"
  - Address ZIP Code: "94105"
  - Address Country: "United States"
```

### Find Specific Lead

```
Resource: Lead
Operation: Find
Lead ID: lead_abc123
```

### Enhanced Opportunity Creation

```
Resource: Opportunity
Operation: Create
Lead ID: lead_abc123
Additional Fields:
  - Status: "Qualified"
  - Assigned to User: "John Doe" (dropdown selection)
  - Confidence: 75
  - Value: 50000
  - Value Period: "Annual"
  - Close Date: "2024-03-15"
  - Note: "High-priority prospect"
```

### Enhanced Opportunity Search

```
Resource: Opportunity
Operation: Find
Lead ID: lead_abc123
Assigned to User: "John Doe"
Additional Filters:
  - Confidence: 80
  - Value Period: "Monthly"
  - Close Date: "2024-12-31"
```

### Create Task with User Assignment

```
Resource: Task
Operation: Create
Lead ID: lead_abc123
Text: "Follow up on proposal"
Date: 2024-01-15T10:00:00Z
Assigned To: "John Doe" (dropdown selection)
```

### Find Custom Activities

```
Resource: Custom Activity
Operation: Find
Lead ID: lead_abc123
Search by Custom Activity ID: custom_abc123
Date Created: 2024-01-01T00:00:00Z
```

### Trigger on Opportunity Status Change

```
Trigger: Opportunity in new Status
Opportunity Status: "Negotiating" (optional - leave empty to monitor all status changes)
```

### Trigger on New Tasks

```
Trigger: New Task
Task Type: "New Tasks Only" (options: All Tasks, New Tasks Only, Completed Tasks Only)
```

## Version History

### 1.0.26 (Latest - Major Enhancement Release) ✨

**🚀 NEW FEATURES:**
- **Enhanced Lead Creation**: Added mobile phone and complete address fields (street, city, state, ZIP, country)
- **Enhanced Opportunity Management**: Added assigned user dropdown, confidence percentage, value period options, and close date
- **New Triggers**: 
  - "Opportunity in new Status" - Monitor opportunity status changes
  - "New Task" - Monitor task creation and completion
- **Enhanced Custom Activities**: Renamed "Get Published" to "Find" with Lead ID and Custom Activity ID search
- **User Assignment**: Close users dropdown across all relevant operations (Create Task, Create/Find Opportunity)

**🔧 IMPROVEMENTS:**
- **Find Lead**: Changed from query-based search to direct Lead ID lookup for precise results
- **Custom Fields**: Enhanced dropdown functionality with proper option loading
- **Published Custom Activity Trigger**: Now includes custom activity name in trigger data
- **URL Field**: Added to Update Lead operation
- **Value Formatted**: Removed from Find Opportunity (cleaner API responses)

**🏗️ TECHNICAL UPDATES:**
- Node classification corrected (moved from trigger to action group)
- Comprehensive test coverage (144/144 tests passing)
- Enhanced error handling and parameter validation
- Improved TypeScript types and interfaces
- Better default parameter handling

**📚 DOCUMENTATION:**
- Updated README with all new features and examples
- Enhanced field descriptions and usage examples
- Complete API coverage documentation

### 1.0.25

- **NEW**: Complete Opportunity Status management
- Opportunity Status operations: Create, Delete, List, Update
- Support for all status types (active, won, lost) with pipeline integration
- Pipeline-specific opportunity status configuration
- Comprehensive test coverage for all operations

### 1.0.24

- **NEW**: Complete Lead Status management
- Lead Status operations: Create, Delete, List, Update
- Support for all status types (active, won, lost)
- Safe deletion with dependency checking

### 1.0.23

- **NEW**: Complete Task management with full CRUD operations
- Task operations: Create, Delete, Get, Update, Find, Bulk Update
- Support for all task types with advanced filtering
- Bulk update operations for efficient task management

### 1.0.22

- **NEW**: Complete SMS Activity management
- Support for SMS drafts, scheduling, sending, and logging
- MMS attachment support with media handling
- Advanced SMS filtering capabilities

### 1.0.21

- **NEW**: Complete Note Activity management
- Support for both plain text and rich HTML content
- Advanced note filtering by lead, user, and date ranges

### 1.0.20

- **NEW**: Complete Meeting Activity management
- Support for meeting transcripts via Close Notetaker integration
- Meeting notes and custom outcome support

### 1.0.19

- **NEW**: Complete Call and Email Activity management
- Rich email functionality including drafts, scheduling, templates
- Call logging with recording URLs and custom outcomes

### 1.0.0

- Initial release with core Lead, Opportunity, and Activity operations
- Dynamic custom field support
- Polling triggers for SmartViews and Status changes

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

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [n8n](https://n8n.io/) for the amazing workflow automation platform
- [Close CRM](https://close.com/) for their comprehensive API
- The n8n community for their support and contributions