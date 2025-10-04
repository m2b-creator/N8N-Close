import {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeOperationError,
} from 'n8n-workflow';

import { closeApiRequest } from './GenericFunctions';
import * as crypto from 'crypto';

function timingSafeEqual(a: Buffer, b: Buffer): boolean {
	if (a.length !== b.length) {
		return false;
	}

	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a[i] ^ b[i];
	}

	return result === 0;
}

function mapAccountSetupAction(action: string): { object_type: string; action: string } | null {
	const mapping: { [key: string]: { object_type: string; action: string } } = {
		custom_field_lead_created: { object_type: 'custom_fields.lead', action: 'created' },
		custom_field_lead_updated: { object_type: 'custom_fields.lead', action: 'updated' },
		custom_field_lead_deleted: { object_type: 'custom_fields.lead', action: 'deleted' },
		custom_field_contact_created: { object_type: 'custom_fields.contact', action: 'created' },
		custom_field_contact_updated: { object_type: 'custom_fields.contact', action: 'updated' },
		custom_field_contact_deleted: { object_type: 'custom_fields.contact', action: 'deleted' },
		custom_field_opportunity_created: { object_type: 'custom_fields.opportunity', action: 'created' },
		custom_field_opportunity_updated: { object_type: 'custom_fields.opportunity', action: 'updated' },
		custom_field_opportunity_deleted: { object_type: 'custom_fields.opportunity', action: 'deleted' },
		custom_field_activity_created: { object_type: 'custom_fields.activity', action: 'created' },
		custom_field_activity_updated: { object_type: 'custom_fields.activity', action: 'updated' },
		custom_field_activity_deleted: { object_type: 'custom_fields.activity', action: 'deleted' },
		custom_activity_type_created: { object_type: 'custom_activity_type', action: 'created' },
		custom_activity_type_updated: { object_type: 'custom_activity_type', action: 'updated' },
		custom_activity_type_deleted: { object_type: 'custom_activity_type', action: 'deleted' },
		status_lead_created: { object_type: 'status.lead', action: 'created' },
		status_lead_updated: { object_type: 'status.lead', action: 'updated' },
		status_lead_deleted: { object_type: 'status.lead', action: 'deleted' },
		status_opportunity_created: { object_type: 'status.opportunity', action: 'created' },
		status_opportunity_updated: { object_type: 'status.opportunity', action: 'updated' },
		status_opportunity_deleted: { object_type: 'status.opportunity', action: 'deleted' },
		membership_activated: { object_type: 'membership', action: 'activated' },
		membership_deactivated: { object_type: 'membership', action: 'deactivated' },
		group_created: { object_type: 'group', action: 'created' },
		group_updated: { object_type: 'group', action: 'updated' },
		group_deleted: { object_type: 'group', action: 'deleted' },
		saved_search_created: { object_type: 'saved_search', action: 'created' },
		saved_search_updated: { object_type: 'saved_search', action: 'updated' },
		phone_number_created: { object_type: 'phone_number', action: 'created' },
		phone_number_updated: { object_type: 'phone_number', action: 'updated' },
		phone_number_deleted: { object_type: 'phone_number', action: 'deleted' },
	};

	return mapping[action] || null;
}

function buildEventsArray(triggerOn: string, actions: string[]): Array<{ object_type: string; action: string }> {
	const events: Array<{ object_type: string; action: string }> = [];

	switch (triggerOn) {
		case 'lead':
			for (const action of actions) {
				if (action === 'status_change') {
					events.push({ object_type: 'activity.lead_status_change', action: 'created' });
				} else {
					events.push({ object_type: 'lead', action });
				}
			}
			break;

		case 'custom_activity':
			for (const action of actions) {
				events.push({ object_type: 'activity.custom_activity', action });
			}
			break;

		case 'contact':
			for (const action of actions) {
				events.push({ object_type: 'contact', action });
			}
			break;

		case 'opportunity':
			for (const action of actions) {
				if (action === 'status_change') {
					events.push({ object_type: 'activity.opportunity_status_change', action: 'created' });
				} else {
					events.push({ object_type: 'opportunity', action });
				}
			}
			break;

		case 'task':
			for (const action of actions) {
				if (action === 'completed') {
					events.push({ object_type: 'activity.task_completed', action: 'created' });
				} else {
					events.push({ object_type: 'task.lead', action });
				}
			}
			break;

		case 'email':
			for (const action of actions) {
				if (action.startsWith('template_')) {
					const templateAction = action.replace('template_', '');
					events.push({ object_type: 'email_template', action: templateAction });
				} else {
					events.push({ object_type: 'activity.email', action });
				}
			}
			break;

		case 'meeting':
			for (const action of actions) {
				events.push({ object_type: 'activity.meeting', action });
			}
			break;

		case 'call':
			for (const action of actions) {
				events.push({ object_type: 'activity.call', action });
			}
			break;

		case 'sms':
			for (const action of actions) {
				events.push({ object_type: 'activity.sms', action });
			}
			break;

		case 'export':
			for (const action of actions) {
				events.push({ object_type: 'export.lead', action });
			}
			break;

		case 'bulk_action':
			for (const action of actions) {
				events.push({ object_type: 'bulk_action.delete', action });
				events.push({ object_type: 'bulk_action.edit', action });
				events.push({ object_type: 'bulk_action.email', action });
				events.push({ object_type: 'bulk_action.sequence_subscription', action });
			}
			break;

		case 'account_setup':
			for (const action of actions) {
				const eventMapping = mapAccountSetupAction(action);
				if (eventMapping) {
					events.push(eventMapping);
				}
			}
			break;
	}

	return events;
}

export class CloseTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Close CRM Trigger',
		name: 'closeTrigger',
		icon: 'file:close.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when Close CRM events occur',
		defaults: {
			name: 'Close CRM Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'closeApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Lead',
						value: 'lead',
					},
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'Opportunity',
						value: 'opportunity',
					},
					{
						name: 'Task',
						value: 'task',
					},
					{
						name: 'Custom Activity',
						value: 'custom_activity',
					},
					{
						name: 'Email',
						value: 'email',
					},
					{
						name: 'Meeting',
						value: 'meeting',
					},
					{
						name: 'Call',
						value: 'call',
					},
					{
						name: 'SMS',
						value: 'sms',
					},
					{
						name: 'Export',
						value: 'export',
					},
					{
						name: 'Bulk Action',
						value: 'bulk_action',
					},
					{
						name: 'Account Setup',
						value: 'account_setup',
					},
				],
				default: 'lead',
				required: true,
				description: 'The entity type to trigger on',
			},
			// Lead Actions
			{
				displayName: 'Actions',
				name: 'leadActions',
				type: 'multiOptions',
				displayOptions: {
					show: {
						event: ['lead'],
					},
				},
				options: [
					{
						name: 'Lead Created',
						value: 'created',
					},
					{
						name: 'Lead Updated',
						value: 'updated',
					},
					{
						name: 'Lead Deleted',
						value: 'deleted',
					},
					{
						name: 'Lead in New Status',
						value: 'status_change',
					},
				],
				default: ['created'],
				required: true,
				description: 'The actions to trigger on for leads',
			},
			// Contact Actions
			{
				displayName: 'Actions',
				name: 'contactActions',
				type: 'multiOptions',
				displayOptions: {
					show: {
						event: ['contact'],
					},
				},
				options: [
					{
						name: 'Contact Created',
						value: 'created',
					},
					{
						name: 'Contact Updated',
						value: 'updated',
					},
					{
						name: 'Contact Deleted',
						value: 'deleted',
					},
				],
				default: ['created'],
				required: true,
				description: 'The actions to trigger on for contacts',
			},
			// Opportunity Actions
			{
				displayName: 'Actions',
				name: 'opportunityActions',
				type: 'multiOptions',
				displayOptions: {
					show: {
						event: ['opportunity'],
					},
				},
				options: [
					{
						name: 'Opportunity Created',
						value: 'created',
					},
					{
						name: 'Opportunity Updated',
						value: 'updated',
					},
					{
						name: 'Opportunity Deleted',
						value: 'deleted',
					},
					{
						name: 'Opportunity in New Status',
						value: 'status_change',
					},
				],
				default: ['created'],
				required: true,
				description: 'The actions to trigger on for opportunities',
			},
			// Task Actions
			{
				displayName: 'Actions',
				name: 'taskActions',
				type: 'multiOptions',
				displayOptions: {
					show: {
						event: ['task'],
					},
				},
				options: [
					{
						name: 'Task Created',
						value: 'created',
					},
					{
						name: 'Task Updated',
						value: 'updated',
					},
					{
						name: 'Task Deleted',
						value: 'deleted',
					},
					{
						name: 'Task Completed',
						value: 'completed',
					},
				],
				default: ['created'],
				required: true,
				description: 'The actions to trigger on for tasks',
			},
			// Custom Activity Actions
			{
				displayName: 'Actions',
				name: 'customActivityActions',
				type: 'multiOptions',
				displayOptions: {
					show: {
						event: ['custom_activity'],
					},
				},
				options: [
					{
						name: 'Custom Activity Created',
						value: 'created',
					},
					{
						name: 'Custom Activity Updated',
						value: 'updated',
					},
					{
						name: 'Custom Activity Deleted',
						value: 'deleted',
					},
				],
				default: ['created'],
				required: true,
				description: 'The actions to trigger on for custom activities',
			},
			// Email Actions
			{
				displayName: 'Actions',
				name: 'emailActions',
				type: 'multiOptions',
				displayOptions: {
					show: {
						event: ['email'],
					},
				},
				options: [
					{
						name: 'Email Created',
						value: 'created',
					},
					{
						name: 'Email Deleted',
						value: 'deleted',
					},
					{
						name: 'Email Sent',
						value: 'sent',
					},
					{
						name: 'Email Template Created',
						value: 'template_created',
					},
					{
						name: 'Email Template Updated',
						value: 'template_updated',
					},
					{
						name: 'Email Template Deleted',
						value: 'template_deleted',
					},
				],
				default: ['created'],
				required: true,
				description: 'The actions to trigger on for emails',
			},
			// Meeting Actions
			{
				displayName: 'Actions',
				name: 'meetingActions',
				type: 'multiOptions',
				displayOptions: {
					show: {
						event: ['meeting'],
					},
				},
				options: [
					{
						name: 'Meeting Created',
						value: 'created',
					},
					{
						name: 'Meeting Updated',
						value: 'updated',
					},
					{
						name: 'Meeting Deleted',
						value: 'deleted',
					},
					{
						name: 'Meeting Scheduled',
						value: 'scheduled',
					},
					{
						name: 'Meeting Started',
						value: 'started',
					},
					{
						name: 'Meeting Completed',
						value: 'completed',
					},
					{
						name: 'Meeting Canceled',
						value: 'canceled',
					},
				],
				default: ['created'],
				required: true,
				description: 'The actions to trigger on for meetings',
			},
			// Call Actions
			{
				displayName: 'Actions',
				name: 'callActions',
				type: 'multiOptions',
				displayOptions: {
					show: {
						event: ['call'],
					},
				},
				options: [
					{
						name: 'Call Created',
						value: 'created',
					},
					{
						name: 'Call Deleted',
						value: 'deleted',
					},
					{
						name: 'Call Answered',
						value: 'answered',
					},
					{
						name: 'Call Completed',
						value: 'completed',
					},
				],
				default: ['created'],
				required: true,
				description: 'The actions to trigger on for calls',
			},
			// SMS Actions
			{
				displayName: 'Actions',
				name: 'smsActions',
				type: 'multiOptions',
				displayOptions: {
					show: {
						event: ['sms'],
					},
				},
				options: [
					{
						name: 'SMS Created',
						value: 'created',
					},
					{
						name: 'SMS Updated',
						value: 'updated',
					},
					{
						name: 'SMS Deleted',
						value: 'deleted',
					},
					{
						name: 'SMS Sent',
						value: 'sent',
					},
				],
				default: ['created'],
				required: true,
				description: 'The actions to trigger on for SMS',
			},
			// Export Actions
			{
				displayName: 'Actions',
				name: 'exportActions',
				type: 'multiOptions',
				displayOptions: {
					show: {
						event: ['export'],
					},
				},
				options: [
					{
						name: 'Export Completed',
						value: 'completed',
					},
				],
				default: ['completed'],
				required: true,
				description: 'The actions to trigger on for exports',
			},
			// Bulk Action Actions
			{
				displayName: 'Actions',
				name: 'bulkActionActions',
				type: 'multiOptions',
				displayOptions: {
					show: {
						event: ['bulk_action'],
					},
				},
				options: [
					{
						name: 'Bulk Action Created',
						value: 'created',
					},
					{
						name: 'Bulk Action Updated',
						value: 'updated',
					},
					{
						name: 'Bulk Action Completed',
						value: 'completed',
					},
				],
				default: ['created'],
				required: true,
				description: 'The actions to trigger on for bulk actions',
			},
			// Account Setup Actions
			{
				displayName: 'Actions',
				name: 'accountSetupActions',
				type: 'multiOptions',
				displayOptions: {
					show: {
						event: ['account_setup'],
					},
				},
				options: [
					{
						name: 'Custom Field (Lead) Created',
						value: 'custom_field_lead_created',
					},
					{
						name: 'Custom Field (Lead) Updated',
						value: 'custom_field_lead_updated',
					},
					{
						name: 'Custom Field (Lead) Deleted',
						value: 'custom_field_lead_deleted',
					},
					{
						name: 'Custom Field (Contact) Created',
						value: 'custom_field_contact_created',
					},
					{
						name: 'Custom Field (Contact) Updated',
						value: 'custom_field_contact_updated',
					},
					{
						name: 'Custom Field (Contact) Deleted',
						value: 'custom_field_contact_deleted',
					},
					{
						name: 'Custom Field (Opportunity) Created',
						value: 'custom_field_opportunity_created',
					},
					{
						name: 'Custom Field (Opportunity) Updated',
						value: 'custom_field_opportunity_updated',
					},
					{
						name: 'Custom Field (Opportunity) Deleted',
						value: 'custom_field_opportunity_deleted',
					},
					{
						name: 'Activity Custom Field Created',
						value: 'custom_field_activity_created',
					},
					{
						name: 'Activity Custom Field Updated',
						value: 'custom_field_activity_updated',
					},
					{
						name: 'Activity Custom Field Deleted',
						value: 'custom_field_activity_deleted',
					},
					{
						name: 'Custom Activity Type Created',
						value: 'custom_activity_type_created',
					},
					{
						name: 'Custom Activity Type Updated',
						value: 'custom_activity_type_updated',
					},
					{
						name: 'Custom Activity Type Deleted',
						value: 'custom_activity_type_deleted',
					},
					{
						name: 'Status (Lead) Created',
						value: 'status_lead_created',
					},
					{
						name: 'Status (Lead) Updated',
						value: 'status_lead_updated',
					},
					{
						name: 'Status (Lead) Deleted',
						value: 'status_lead_deleted',
					},
					{
						name: 'Status (Opportunity) Created',
						value: 'status_opportunity_created',
					},
					{
						name: 'Status (Opportunity) Updated',
						value: 'status_opportunity_updated',
					},
					{
						name: 'Status (Opportunity) Deleted',
						value: 'status_opportunity_deleted',
					},
					{
						name: 'Membership Activated',
						value: 'membership_activated',
					},
					{
						name: 'Membership Deactivated',
						value: 'membership_deactivated',
					},
					{
						name: 'Group Created',
						value: 'group_created',
					},
					{
						name: 'Group Updated',
						value: 'group_updated',
					},
					{
						name: 'Group Deleted',
						value: 'group_deleted',
					},
					{
						name: 'Saved Search Created',
						value: 'saved_search_created',
					},
					{
						name: 'Saved Search Updated',
						value: 'saved_search_updated',
					},
					{
						name: 'Phone Number Created',
						value: 'phone_number_created',
					},
					{
						name: 'Phone Number Updated',
						value: 'phone_number_updated',
					},
					{
						name: 'Phone Number Deleted',
						value: 'phone_number_deleted',
					},
				],
				default: ['custom_field_lead_created'],
				required: true,
				description: 'The actions to trigger on for account setup changes',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				if (webhookData.webhookId === undefined) {
					return false;
				}

				try {
					await closeApiRequest.call(this, 'GET', `/webhook/${webhookData.webhookId}`);
					return true;
				} catch {
					return false;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const webhookData = this.getWorkflowStaticData('node');
				const triggerOn = this.getNodeParameter('event') as string;

				// Convert event name to camelCase for parameter name
				const actionsParam = triggerOn
					.split('_')
					.map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
					.join('') + 'Actions';

				let selectedActions: string[] = [];

				try {
					selectedActions = this.getNodeParameter(actionsParam) as string[];
				} catch {
					selectedActions = ['created'];
				}

				const events = buildEventsArray(triggerOn, selectedActions);

				const body = {
					url: webhookUrl,
					events,
				};

				try {
					const responseData = await closeApiRequest.call(this, 'POST', '/webhook/', body);

					if (responseData.id === undefined || responseData.signature_key === undefined) {
						return false;
					}

					webhookData.webhookId = responseData.id as string;
					webhookData.signatureKey = responseData.signature_key as string;

					return true;
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : 'Unknown error';
					throw new NodeOperationError(
						this.getNode(),
						`Failed to create webhook: ${errorMessage}`,
					);
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId !== undefined) {
					try {
						await closeApiRequest.call(this, 'DELETE', `/webhook/${webhookData.webhookId}`);
					} catch {
						return false;
					}

					delete webhookData.webhookId;
					delete webhookData.signatureKey;
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const webhookData = this.getWorkflowStaticData('node');
		const headerData = this.getHeaderData();

		const signatureKey = webhookData.signatureKey as string;
		if (signatureKey) {
			const timestamp = headerData['close-sig-timestamp'] as string;
			const receivedHash = headerData['close-sig-hash'] as string;

			if (!timestamp || !receivedHash) {
				throw new NodeOperationError(
					this.getNode(),
					'Missing signature headers from Close webhook',
				);
			}

			// Get the raw body - Close CRM requires the exact body string for signature verification
			let bodyString: string;

			// Try to get rawBody from request (this is set by n8n's body-parser middleware)
			if ((req as any).rawBody !== undefined) {
				// rawBody can be either a Buffer or a string
				bodyString = typeof (req as any).rawBody === 'string'
					? (req as any).rawBody
					: (req as any).rawBody.toString();
			}
			// Fallback: try body as string
			else if (typeof (req as any).body === 'string') {
				bodyString = (req as any).body;
			}
			// Last resort: stringify the parsed body
			// Note: This may fail signature verification if the JSON formatting differs
			else {
				bodyString = JSON.stringify(req.body);
			}

			const keyBuffer = Buffer.from(signatureKey, 'hex');

			const expectedHash = crypto
				.createHmac('sha256', keyBuffer)
				.update(timestamp + bodyString)
				.digest('hex');

			if (!timingSafeEqual(Buffer.from(receivedHash), Buffer.from(expectedHash))) {
				throw new NodeOperationError(
					this.getNode(),
					'Webhook signature verification failed - invalid signature',
				);
			}
		}

		return {
			workflowData: [this.helpers.returnJsonArray(req.body as any)],
		};
	}
}
