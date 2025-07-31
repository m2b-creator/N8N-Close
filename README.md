# n8n-nodes-close-crm

![n8n.io - Workflow Automation](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png)

This is an n8n community node that lets you use Close CRM in your n8n workflows.

Close CRM is a sales CRM built for high-growth companies that need to scale their sales operations.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Actions (Close CRM Node)

**Lead**
- Find: Search for leads using queries, SmartViews, or status filters
- Update: Update lead information including custom fields

**Opportunity**
- Find: Search for opportunities by lead or status
- Update: Update opportunity details

**Task**
- Create: Create new tasks for leads

**Note**
- Create: Create notes for leads

**Call**
- Find: Search for call activities

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

### Create Task
```
Resource: Task
Operation: Create
Lead ID: lead_abc123
Text: "Follow up with customer"
Date: 2024-01-15T10:00:00Z
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

## Version history

### 1.0.0
- Initial release
- Support for Lead, Opportunity, Task, Note, Call, and Custom Activity operations
- Polling triggers for SmartViews, Status changes, and Custom Activities
- Dynamic custom field support
- Full Close CRM API integration