# Close CRM Webhook Node Guide

## Overview

The Close CRM Webhook node provides real-time event notifications from Close CRM using webhooks instead of polling. This is more efficient and provides instant updates when events occur in your Close CRM account.

## Features

### Supported Events

The webhook node supports the following event types:

1. **Lead Created** (`lead.created`)
   - Triggers when a new lead is created in Close CRM

2. **Lead Updated** (`lead.updated`)
   - Triggers when a lead is updated (any field change)

3. **Lead Deleted** (`lead.deleted`)
   - Triggers when a lead is deleted

4. **Lead Status Changed** (`activity.lead_status_change.created`)
   - Triggers when a lead changes status (not just any update)

5. **Opportunity Status Changed** (`activity.opportunity_status_change.created`)
   - Triggers when an opportunity changes status

6. **Task Created** (`task.created`)
   - Triggers when a new task is created

7. **Custom Activity Created** (`custom_activity.created`)
   - Triggers when a custom activity is published

### Security Features

#### Signature Verification
- **Enabled by default** - Verifies that webhook requests are genuinely from Close CRM
- Uses HMAC-SHA256 signature validation
- Prevents unauthorized webhook calls
- Checks timestamp to prevent replay attacks (5-minute tolerance)

#### Idempotency Check
- **Enabled by default** - Prevents duplicate event processing
- Stores the last 1000 event IDs to detect duplicates
- Automatically ignores duplicate events

## Usage

### Setup

1. **Add the Close CRM Webhook node** to your workflow
2. **Select events** - Choose one or more events to listen for
3. **Configure options** (optional):
   - Signature Verification: Enable/disable webhook signature validation
   - Idempotency Check: Enable/disable duplicate event detection
4. **Activate the workflow**

### How It Works

#### When You Activate the Workflow:
1. n8n generates a unique webhook URL for your workflow
2. The node automatically registers this URL with Close CRM via their API
3. Close CRM sends a subscription ID and signature key back
4. These are stored securely in the workflow's static data

#### When an Event Occurs:
1. Close CRM sends a POST request to your webhook URL
2. The node verifies the signature (if enabled)
3. The node checks for duplicate events (if enabled)
4. The event data is enriched with metadata
5. Your workflow continues with the event data

#### When You Deactivate the Workflow:
1. The node automatically deletes the webhook subscription from Close CRM
2. Close CRM stops sending events to your webhook URL
3. The subscription ID and signature key are removed

## Event Data Structure

Each webhook event includes:

```json
{
  "event": "lead.created",
  "event_id": "unique-event-id",
  "object_type": "lead",
  "action": "created",
  "object_id": "lead_xxx",
  "data": {
    // The actual lead/opportunity/task/activity data
  },
  "webhook_metadata": {
    "received_at": "2025-09-30T20:39:00Z",
    "webhook_url": "https://your-n8n.com/webhook/...",
    "signature_verified": true
  }
}
```

## Comparison: Webhook vs Polling Trigger

### Webhook Node (CloseWebhook) - Recommended
✅ **Advantages:**
- **Real-time** - Instant notifications when events occur
- **Efficient** - No continuous API polling
- **Lower API usage** - Only receives events when they happen
- **No missed events** - Reliable event delivery
- **Better performance** - Immediate workflow execution

❌ **Disadvantages:**
- Requires accessible webhook URL (n8n must be reachable from internet)
- Slightly more complex setup (handled automatically)

### Polling Trigger (CloseTrigger) - Legacy
✅ **Advantages:**
- Works behind firewalls
- No webhook URL required
- SmartView support with complex filtering

❌ **Disadvantages:**
- **Delayed detection** - Only checks at intervals
- **Higher API usage** - Continuous polling
- **Potential missed events** - If data changes between polls
- **Performance overhead** - Constant background requests

## Migration from Polling to Webhooks

If you're using the old `CloseTrigger` (polling) node, here's how to migrate:

### Mapping Table

| Old Trigger Event | New Webhook Event |
|-------------------|-------------------|
| New Lead in Status | Lead Status Changed |
| Opportunity in new Status | Opportunity Status Changed |
| New Task | Task Created |
| Published Custom Activity | Custom Activity Created |

### Migration Steps

1. **Create a new workflow** or duplicate your existing one
2. **Replace** the `Close CRM Trigger` node with `Close CRM Webhook`
3. **Select equivalent events** using the mapping table above
4. **Test** the new workflow
5. **Deactivate** the old polling workflow
6. **Activate** the new webhook workflow

**Note:** The "New Lead in SmartView" trigger doesn't have a direct webhook equivalent, as Close doesn't provide SmartView-specific webhooks. For this use case, you can:
- Use `Lead Updated` webhook and filter by SmartView criteria in your workflow
- Keep using the polling trigger for SmartView-specific triggers

## Troubleshooting

### Webhook Not Receiving Events

1. **Check workflow activation** - Workflow must be active
2. **Verify n8n accessibility** - Webhook URL must be accessible from internet
3. **Check Close CRM webhook list** - Visit Close CRM settings to see active webhooks
4. **Review logs** - Check n8n execution logs for errors

### Signature Verification Failures

1. **Clock synchronization** - Ensure your server time is accurate
2. **Timestamp tolerance** - Events older than 5 minutes are rejected
3. **Reactivate workflow** - Deactivate and reactivate to refresh signature key

### Duplicate Events

1. **Enable idempotency check** - Turned on by default
2. **Custom deduplication** - Add additional logic in your workflow if needed

## API References

- [Close Webhook Documentation](https://developer.close.com/resources/webhook-subscriptions)
- [Close API Reference](https://developer.close.com/api-reference)

## Security Best Practices

1. ✅ **Keep signature verification enabled** - Default and recommended
2. ✅ **Use HTTPS** - Ensure your n8n instance uses HTTPS
3. ✅ **Monitor webhook logs** - Review failed verification attempts
4. ✅ **Rotate API keys regularly** - Update Close API credentials periodically
5. ✅ **Enable idempotency checks** - Prevent duplicate processing

## Support

For issues or questions:
- GitHub: https://github.com/m2b-creator/N8N-Close/issues
- Close API: https://developer.close.com
