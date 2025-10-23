<div align="center">

# n8n-nodes-close-crm

<p align="center">
  <img src="https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png" alt="n8n" height="100" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./nodes/Close/close.svg" alt="Close CRM" height="100" />
</p>

**A powerful n8n community node for Close CRM integration**

[![npm version](https://badge.fury.io/js/n8n-nodes-close-crm.svg)](https://www.npmjs.com/package/n8n-nodes-close-crm)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

[What's New](#-whats-new-in-140) • [Installation](#installation) • [Features](#features) • [Credentials](#credentials) • [Usage Examples](#usage-examples) • [Resources](#resources)

</div>

---

## 📖 About

This n8n community node provides comprehensive integration with **Close CRM**, a sales CRM built for high-growth companies that need to scale their sales operations.

**Current Version: 1.4.0** - Now with enhanced lead contact handling, HTML to Portable Text conversion, advanced filtering options, and improved custom field support!

**What is n8n?** [n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform that lets you connect different services and automate tasks.

## 🆕 What's New in 1.4.0

- **Enhanced Lead Management**: Preserve existing contacts on update operations and add contacts/address fields
- **HTML to Portable Text**: Automatic conversion for rich text fields
- **Advanced Filtering**: New activity_at filters for meetings and statusType parameter for opportunities
- **Improved User Experience**: Better date filter display names across all activity types
- **User Notes Enhancement**: Support for user_note_html field with plain text to Portable Text conversion

See the [CHANGELOG](CHANGELOG.md) for complete version history.

## 🚀 Installation

<details>
<summary><b>Option 1: n8n Community Nodes (Recommended)</b></summary>

1. Navigate to **Settings > Community Nodes** in your n8n instance
2. Click **Install**
3. Enter `n8n-nodes-close-crm` as the package name
4. Agree to the risks of using community nodes
5. Click **Install**

✅ After installation, the Close CRM node will appear in your node palette.

</details>

<details>
<summary><b>Option 2: npm (Manual Installation)</b></summary>

For n8n instances running with npm:

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-close-crm
```

</details>

<details>
<summary><b>Option 3: Docker</b></summary>

**Method A:** Add to `docker-compose.yml`

```yaml
environment:
  - N8N_COMMUNITY_PACKAGES=n8n-nodes-close-crm
```

**Method B:** Install in running container

```bash
docker exec -it n8n npm install n8n-nodes-close-crm
```

</details>

## ✨ Features

### 📋 Core Resources

<details>
<summary><b>Lead Management</b></summary>

| Operation | Description |
|-----------|-------------|
| Create | Create leads with enhanced contact details, address information, and custom fields |
| Delete | Remove existing leads |
| Find | Direct lookup by Lead ID for detailed information |
| Merge | Combine two leads into one |
| Update | Modify lead information including contacts, address fields, URL, and custom fields with preservation of existing contacts |

**Enhanced Features:**
- ✨ Preserve existing contacts on update operations
- ✨ Support for contacts and address fields in lead updates
- ✨ HTML to Portable Text format conversion for rich text fields

</details>

<details>
<summary><b>Lead Status Management</b></summary>

| Operation | Description |
|-----------|-------------|
| Create | Create new lead statuses (active, won, lost) |
| Delete | Remove lead statuses (ensures no dependencies) |
| List | View all lead statuses for your organization |
| Update | Rename and modify lead statuses |

</details>

<details>
<summary><b>Opportunity Management</b></summary>

| Operation | Description |
|-----------|-------------|
| Create | Create opportunities with assigned user, confidence, value period, close date |
| Delete | Remove existing opportunities |
| Find | Advanced filtering by ID, user, confidence, value period, close date, and status type |
| Update | Modify opportunity details including status, value, and notes |

**Enhanced Features:**
- ✨ Status type parameter for enhanced opportunity filtering (Active, Won, Lost)

</details>

<details>
<summary><b>Opportunity Status Management</b></summary>

| Operation | Description |
|-----------|-------------|
| Create | Create opportunity statuses with pipeline support |
| Delete | Remove statuses (ensures no dependencies) |
| List | View all opportunity statuses |
| Update | Rename and modify statuses with pipeline management |

</details>

<details>
<summary><b>Task Management</b></summary>

| Operation | Description |
|-----------|-------------|
| Create | Create tasks with user assignment dropdown |
| Delete | Remove task activities |
| Find | Advanced filtering by type, lead, view, etc. |
| Get | Fetch a single task activity |
| Update | Modify task details including completion status |
| Bulk Update | Update multiple tasks with filtering |

**Enhanced Features:**
- ✨ Improved date filter display names for better clarity

</details>

### 📞 Activity Management

<details>
<summary><b>Communication Activities (Note, Call, Email, Meeting, SMS)</b></summary>

**Note Activities**
- Create (plain text or rich HTML with Portable Text conversion)
- Delete, Find, Get, Update
- ✨ Enhanced user_note_html field support
- ✨ Automatic plain text to Portable Text format conversion

**Call Activities**
- Create (log calls made outside Close VoIP)
- Delete, Find, Get, Update (including notes and outcomes)

**Email Activities**
- Create (draft, send, schedule, or log)
- Delete, Find, Get, Update (modify drafts or change status)

**Meeting Activities**
- Delete, Find (with activity_at date filters)
- Get (with optional transcripts)
- Update (including notes and outcomes)
- ✨ Improved date filter display names for better clarity

**SMS Activities**
- Create (draft, send, schedule, or log with MMS support)
- Delete, Find, Get, Update
- ✨ Improved date filter display names for better clarity

</details>

<details>
<summary><b>Custom Activities</b></summary>

| Operation | Description |
|-----------|-------------|
| Create | Create custom activities with custom fields and status |
| Delete | Remove custom activities |
| Find | Search by Lead ID, Custom Activity ID, or date filters |
| Get | Fetch a single custom activity with details |
| Update | Modify custom activity details and custom fields |

**Enhanced Features:**
- ✨ Status field support for custom activities
- ✨ Comprehensive rich text field support with HTML formatting
- ✨ Portable Text conversion for rich text custom fields
- ✨ Enhanced compatibility for multiple value fields
- ✨ Improved HTML wrapping for rich text content

</details>

### 🔔 Workflow Triggers (Webhooks)

The Close CRM Trigger node provides comprehensive webhook-based triggers with **secure signature verification**. You can monitor events for:

<details>
<summary><b>Lead Triggers</b></summary>

- Lead Created
- Lead Updated
- Lead Deleted
- Lead in New Status (status change)

</details>

<details>
<summary><b>Contact Triggers</b></summary>

- Contact Created
- Contact Updated
- Contact Deleted

</details>

<details>
<summary><b>Opportunity Triggers</b></summary>

- Opportunity Created
- Opportunity Updated
- Opportunity Deleted
- Opportunity Status Change

</details>

<details>
<summary><b>Task Triggers</b></summary>

- Task Created
- Task Updated
- Task Deleted
- Task Completed

</details>

<details>
<summary><b>Activity Triggers</b></summary>

**Custom Activity:**
- Custom Activity Created
- Custom Activity Updated
- Custom Activity Deleted

**Email:**
- Email Created
- Email Updated
- Email Deleted
- Email Template Created
- Email Template Updated
- Email Template Deleted

**Meeting:**
- Meeting Created
- Meeting Updated
- Meeting Deleted

**Call:**
- Call Created
- Call Updated
- Call Deleted

**SMS:**
- SMS Created
- SMS Updated
- SMS Deleted

</details>

<details>
<summary><b>System & Admin Triggers</b></summary>

**Export:**
- Export Started
- Export Completed
- Export Failed

**Bulk Actions:**
- Bulk Delete, Edit, Email, Sequence Subscription (Started, Completed, Failed)

**Account Setup:**
- Custom Field Changes (Lead, Contact, Opportunity, Activity)
- Custom Activity Type Changes
- Status Changes (Lead, Opportunity)
- Membership Changes (Activated, Deactivated)
- Group Changes (Created, Updated, Deleted)
- Saved Search Changes (Created, Updated)
- Phone Number Changes (Created, Updated, Deleted)

</details>

**Security:** All webhook triggers include robust signature verification to ensure authenticity and prevent unauthorized access.

## 🔐 Credentials

**Quick Setup:**

1. 🔑 Get your API key from [Close CRM account settings](https://app.close.com/settings/api/)
2. ➕ Create new credentials in n8n using the **"Close API"** credential type
3. 📝 Paste your API key

## ⚙️ Compatibility

| Requirement | Version |
|-------------|---------|
| n8n | 0.200.0 or higher |
| Node.js | 18.10 or higher |

## 📚 Usage Examples

<details>
<summary><b>Create a Lead with Full Contact Information</b></summary>

```yaml
Resource: Lead
Operation: Create
Name: "Acme Corporation"

Additional Fields:
  Description: "B2B SaaS company"
  URL: "https://acme.com"
  Status: "Qualified"

Contacts:
  Name: "John Smith"
  Office Email: "john@acme.com"
  Office Phone: "+1-555-0123"
  Mobile Phone: "+1-555-0124"

Address:
  Street: "123 Main St"
  City: "San Francisco"
  State: "CA"
  ZIP Code: "94105"
  Country: "United States"
```

</details>

<details>
<summary><b>Find a Specific Lead</b></summary>

```yaml
Resource: Lead
Operation: Find
Lead ID: lead_abc123
```

</details>

<details>
<summary><b>Create an Opportunity with Advanced Fields</b></summary>

```yaml
Resource: Opportunity
Operation: Create
Lead ID: lead_abc123

Additional Fields:
  Status: "Qualified"
  Assigned to User: "John Doe"
  Confidence: 75
  Value: 50000
  Value Period: "Annual"
  Close Date: "2024-03-15"
  Note: "High-priority prospect"
```

</details>

<details>
<summary><b>Search Opportunities with Filters</b></summary>

```yaml
Resource: Opportunity
Operation: Find

# Direct lookup by ID
Opportunity ID: oppo_abc123

# OR filter by criteria
Lead ID: lead_abc123
Assigned to User: "John Doe"

Filters:
  Confidence: 80
  Value Period: "Monthly"
  Close Date: "2024-12-31"
```

</details>

<details>
<summary><b>Create a Task with Assignment</b></summary>

```yaml
Resource: Task
Operation: Create
Lead ID: lead_abc123
Text: "Follow up on proposal"
Date: 2024-01-15T10:00:00Z
Assigned To: "John Doe"
```

</details>

<details>
<summary><b>Search Custom Activities</b></summary>

```yaml
Resource: Custom Activity
Operation: Find
Lead ID: lead_abc123
Custom Activity ID: custom_abc123
Date Created: 2024-01-01T00:00:00Z
```

</details>

<details>
<summary><b>Trigger: Monitor Opportunity Status Changes</b></summary>

```yaml
Trigger: Opportunity in new Status
Opportunity Status: "Negotiating"
# Leave empty to monitor all status changes
```

</details>

<details>
<summary><b>Trigger: Monitor New Tasks</b></summary>

```yaml
Trigger: New Task
Task Type: "New Tasks Only"
# Options: All Tasks, New Tasks Only, Completed Tasks Only
```

</details>

## 📖 Resources

- 📘 [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- 🔧 [Close CRM API Documentation](https://developer.close.com/)
- 🌐 [Close CRM Website](https://close.com/)

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. 🍴 Fork the repository
2. 🌿 Create your feature branch: `git checkout -b feature/amazing-feature`
3. 💾 Commit your changes: `git commit -m 'Add amazing feature'`
4. 📤 Push to the branch: `git push origin feature/amazing-feature`
5. 🔀 Open a Pull Request

## 💬 Support

**Need help?**

- 🐛 Check [GitHub Issues](https://github.com/m2b-creator/N8N-Close/issues)
- ➕ Create a new issue with detailed information about your setup
- 📝 Include error messages, screenshots, and steps to reproduce

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[n8n](https://n8n.io/)** - For the amazing workflow automation platform
- **[Close CRM](https://close.com/)** - For their comprehensive API
- **The n8n Community** - For their continuous support and contributions

---

<div>

**Made with ❤️ for the n8n community**

[⬆ Back to Top](#n8n-nodes-close-crm)

</div>