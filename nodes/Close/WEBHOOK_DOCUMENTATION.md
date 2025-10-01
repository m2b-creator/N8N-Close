# Close CRM Webhook Trigger Documentation

## Overview

The Close CRM Webhook Trigger node allows n8n workflows to execute automatically when events occur in your Close CRM account. This provides real-time integration with Close CRM, eliminating the need for polling-based triggers.

## Features

- **Real-time event processing**: Workflows trigger instantly when events occur in Close CRM
- **Comprehensive event coverage**: Support for 12 event categories with 60+ specific event types
- **Secure webhook verification**: HMAC-SHA256 signature validation to prevent unauthorized requests
- **Automatic lifecycle management**: Webhooks are automatically registered on activation and cleaned up on deactivation
- **Flexible action selection**: Choose specific actions within each event category

## Setup

### Prerequisites

- Close CRM account with API access
- Close CRM API key (available in Settings → API Keys)
- Configured Close API credentials in n8n

### Basic Configuration

1. Add the "Close Webhook" node to your workflow
2. Select your Close API credentials
3. Choose a **Trigger On** category (e.g., Lead, Contact, Opportunity)
4. Select one or more **Actions** for that category
5. Activate the workflow

The node will automatically:
- Register a webhook with Close CRM
- Store the webhook ID and signature key
- Begin receiving events immediately

## Event Categories

### 1. Lead

Monitor changes to lead records in your CRM.

**Available Actions:**
- **Lead Created**: Triggered when a new lead is created
- **Lead Updated**: Triggered when a lead is modified
- **Lead Deleted**: Triggered when a lead is deleted
- **Lead in New Status**: Triggered when a lead moves to a different status

**API Mapping:**
- Created/Updated/Deleted: `object_type: "lead"`, `action: "created|updated|deleted"`
- Status Change: `object_type: "activity.lead_status_change"`, `action: "created"`

### 2. Custom Activity

Track custom activity types you've created in Close CRM.

**Available Actions:**
- **Custom Activity Created**: New custom activity logged
- **Custom Activity Updated**: Custom activity modified
- **Custom Activity Deleted**: Custom activity removed

**API Mapping:**
- Created: `object_type: "custom_activity"`, `action: "created"`
- Updated/Deleted: `object_type: "activity.custom_activity"`, `action: "updated|deleted"`

### 3. Contact

Monitor contact records within leads.

**Available Actions:**
- **Contact Created**: New contact added to a lead
- **Contact Updated**: Contact information modified
- **Contact Deleted**: Contact removed from a lead

**API Mapping:**
- All actions: `object_type: "contact"`, `action: "created|updated|deleted"`

### 4. Opportunity

Track sales opportunities and deals.

**Available Actions:**
- **Opportunity Created**: New opportunity created
- **Opportunity Updated**: Opportunity details modified
- **Opportunity Deleted**: Opportunity removed
- **Opportunity in New Status**: Opportunity moves through pipeline stages

**API Mapping:**
- Created/Updated/Deleted: `object_type: "opportunity"`, `action: "created|updated|deleted"`
- Status Change: `object_type: "activity.opportunity_status_change"`, `action: "created"`

### 5. Task

Monitor task management and completion.

**Available Actions:**
- **Task Created**: New task assigned
- **Task Updated**: Task details modified
- **Task Deleted**: Task removed
- **Task Completed**: Task marked as complete

**API Mapping:**
- Created/Updated/Deleted: `object_type: "task.lead"`, `action: "created|updated|deleted"`
- Completed: `object_type: "activity.task_completed"`, `action: "created"`

### 6. Email

Track email activities and template changes.

**Available Actions:**
- **Email Created**: New email logged
- **Email Deleted**: Email removed
- **Email Sent**: Email successfully sent
- **Email Template Created**: New email template created
- **Email Template Updated**: Email template modified
- **Email Template Deleted**: Email template removed

**API Mapping:**
- Email actions: `object_type: "activity.email"`, `action: "created|deleted|sent"`
- Template actions: `object_type: "email_template"`, `action: "created|updated|deleted"`

### 7. Meeting

Monitor meeting scheduling and status.

**Available Actions:**
- **Meeting Created**: New meeting scheduled
- **Meeting Updated**: Meeting details changed
- **Meeting Deleted**: Meeting cancelled/removed
- **Meeting Scheduled**: Meeting time confirmed
- **Meeting Started**: Meeting began
- **Meeting Completed**: Meeting finished
- **Meeting Canceled**: Meeting cancelled

**API Mapping:**
- All actions: `object_type: "activity.meeting"`, `action: "created|updated|deleted|scheduled|started|completed|canceled"`

### 8. Call

Track phone call activities.

**Available Actions:**
- **Call Created**: New call logged
- **Call Deleted**: Call record removed
- **Call Answered**: Call was answered
- **Call Completed**: Call finished

**API Mapping:**
- All actions: `object_type: "activity.call"`, `action: "created|deleted|answered|completed"`

### 9. SMS

Monitor SMS/text message activities.

**Available Actions:**
- **SMS Created**: New SMS logged
- **SMS Updated**: SMS details modified
- **SMS Deleted**: SMS record removed
- **SMS Sent**: SMS successfully sent

**API Mapping:**
- All actions: `object_type: "activity.sms"`, `action: "created|updated|deleted|sent"`

### 10. Export

Track data export operations.

**Available Actions:**
- **Export Completed**: Data export finished processing

**API Mapping:**
- Completed: `object_type: "export.lead"`, `action: "completed"`

### 11. Bulk Action

Monitor bulk operations performed in Close CRM.

**Available Actions:**
- **Bulk Action Created**: Bulk operation initiated
- **Bulk Action Updated**: Bulk operation status updated
- **Bulk Action Completed**: Bulk operation finished

**API Mapping:**
- All types: `object_type: "bulk_action.delete|edit|email|sequence_subscription"`, `action: "created|updated|completed"`

**Note**: When selecting bulk action events, all four bulk action types (delete, edit, email, sequence_subscription) are registered to ensure complete coverage.

### 12. Close Account Setup

Monitor administrative changes to your Close CRM configuration.

**Available Actions:**

#### Custom Fields
- Custom Field (Lead/Contact/Opportunity/Activity) Created/Updated/Deleted
- Tracks changes to custom field definitions

#### Custom Activity Types
- Custom Activity Type Created/Updated/Deleted
- Monitors custom activity type configuration

#### Statuses
- Status (Lead/Opportunity) Created/Updated/Deleted
- Tracks pipeline status changes

#### Users & Permissions
- Membership Activated/Deactivated
- Group Created/Updated/Deleted

#### Other
- Saved Search Created/Updated
- Phone Number Created/Updated/Deleted

**API Mapping Examples:**
- `object_type: "custom_fields.lead"`, `action: "created|updated|deleted"`
- `object_type: "status.opportunity"`, `action: "created|updated|deleted"`
- `object_type: "membership"`, `action: "activated|deactivated"`

## Security

### Webhook Signature Verification

Every webhook request from Close CRM includes cryptographic signatures to verify authenticity:

**Headers:**
- `close-sig-timestamp`: Unix timestamp when the request was sent
- `close-sig-hash`: HMAC-SHA256 hash of the payload

**Verification Process:**
1. Extract timestamp and hash from headers
2. Compute expected hash: `HMAC-SHA256(signature_key, timestamp + body)`
3. Compare received hash with expected hash using constant-time comparison
4. Reject requests with invalid signatures

**Security Features:**
- Constant-time comparison prevents timing attacks
- Signature key is securely stored in workflow state
- Automatic rejection of unsigned or improperly signed requests

### Best Practices

1. **Keep workflows active**: Deactivated workflows will have their webhooks automatically deleted
2. **Monitor failed events**: Check workflow execution history for signature verification failures
3. **Secure your n8n instance**: Use HTTPS endpoints for webhook URLs
4. **API key security**: Protect your Close API credentials with appropriate n8n access controls

## Webhook Lifecycle

### Activation (Node Enabled)

When you activate a workflow with the Close Webhook trigger:

1. **Get webhook URL**: n8n provides a unique webhook endpoint URL
2. **Build events array**: Selected actions are mapped to Close API event format
3. **Register webhook**: POST request to `https://api.close.com/api/v1/webhook/`
   ```json
   {
     "url": "https://your-n8n-instance.com/webhook/...",
     "events": [
       { "object_type": "lead", "action": "created" },
       { "object_type": "lead", "action": "updated" }
     ]
   }
   ```
4. **Store credentials**: Save `webhook_id` and `signature_key` in workflow state
5. **Ready**: Webhook is active and will receive events

### Event Reception

When an event occurs in Close CRM:

1. **Event triggered**: Close sends POST request to your webhook URL
2. **Headers included**: `close-sig-timestamp` and `close-sig-hash`
3. **Signature verification**: Node validates the request authenticity
4. **Workflow execution**: Valid events trigger the workflow

### Deactivation (Node Disabled)

When you deactivate a workflow:

1. **Retrieve webhook ID**: Get stored webhook_id from workflow state
2. **Delete webhook**: DELETE request to `https://api.close.com/api/v1/webhook/{webhook_id}`
3. **Clean up state**: Remove webhook_id and signature_key from workflow state
4. **Complete**: Webhook unregistered, no more events received

## Troubleshooting

### Webhook Not Triggering

**Problem**: Workflow doesn't execute when events occur in Close CRM

**Solutions:**
1. Verify workflow is activated (green indicator)
2. Check that the webhook exists: Go to Close CRM → Settings → API → Webhooks
3. Review workflow execution history for errors
4. Test with a simple event (e.g., create a test lead)

### Signature Verification Failed

**Problem**: Events are rejected with "Webhook signature verification failed"

**Solutions:**
1. Ensure your n8n instance URL is accessible from the internet
2. Check that the workflow hasn't been deactivated and reactivated (recreates signature key)
3. Verify no proxy or middleware is modifying webhook requests
4. Check system time on your n8n server is accurate

### Multiple Events Received

**Problem**: Workflow executes multiple times for a single action

**Solutions:**
1. This is expected behavior for Close CRM (they may retry failed webhooks)
2. Implement idempotency in your workflow using the `event.id` field
3. Use n8n's built-in deduplication features if available

### Webhook Registration Failed

**Problem**: Error when activating workflow: "Failed to create webhook"

**Solutions:**
1. Verify Close API credentials are valid and have webhook permissions
2. Check Close CRM webhook limit (organizations have a maximum number of webhooks)
3. Ensure your n8n instance is reachable from the internet (Close must be able to POST to it)
4. Review error details in n8n's workflow logs

## Webhook Payload Examples

### Lead Created Event
```json
{
  "event": "lead.created",
  "data": {
    "id": "lead_xxx",
    "name": "Acme Corp",
    "status_id": "stat_xxx",
    "contacts": [...],
    "custom": {...},
    "created_by": "user_xxx",
    "date_created": "2025-01-15T10:30:00.000Z"
  },
  "subscription_id": "whsub_xxx",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "id": "ev_xxx"
}
```

### Opportunity Status Change Event
```json
{
  "event": "opportunity.status_change",
  "data": {
    "id": "oppo_xxx",
    "lead_id": "lead_xxx",
    "status_id": "stat_new",
    "old_status_id": "stat_old",
    "value": 50000,
    "confidence": 50
  },
  "subscription_id": "whsub_xxx",
  "timestamp": "2025-01-15T11:00:00.000Z",
  "id": "ev_xxx"
}
```

## API Reference

### Close CRM Webhook API

**Create Webhook:**
```
POST https://api.close.com/api/v1/webhook/
Authorization: Basic base64(API_KEY:)
Content-Type: application/json

{
  "url": "string",
  "events": [{ "object_type": "string", "action": "string" }],
  "filters": {} // optional
}
```

**Delete Webhook:**
```
DELETE https://api.close.com/api/v1/webhook/{subscription_id}/
Authorization: Basic base64(API_KEY:)
```

**List Webhooks:**
```
GET https://api.close.com/api/v1/webhook/
Authorization: Basic base64(API_KEY:)
```

## Additional Resources

- [Close CRM Webhook Documentation](https://developer.close.com/resources/webhooks/)
- [Close CRM API Reference](https://developer.close.com/)
- [n8n Documentation](https://docs.n8n.io/)
- [GitHub Repository](https://github.com/m2b-creator/N8N-Close)

## Version History

- **v1.0.100**: Initial webhook trigger implementation
  - Support for 12 event categories
  - 60+ specific event types
  - HMAC-SHA256 signature verification
  - Automatic lifecycle management

## Support

For issues or questions:
- [GitHub Issues](https://github.com/m2b-creator/N8N-Close/issues)
- [Close CRM Support](https://help.close.com/)
- [n8n Community](https://community.n8n.io/)
