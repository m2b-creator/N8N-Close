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