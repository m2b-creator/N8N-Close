import {
	IHookFunctions,
	IWebhookFunctions,
	IWebhookResponseData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import { closeApiRequest } from './GenericFunctions';
import * as crypto from 'crypto';

export class CloseWebhook implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Close CRM Webhook',
		name: 'closeWebhook',
		icon: 'file:close.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"]}}',
		description: 'Handle Close CRM webhook events',
		defaults: {
			name: 'Close CRM Webhook',
		},
		inputs: [],
		outputs: [{ type: 'main' as NodeConnectionType }],
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
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				options: [
					{
						name: 'Lead Created',
						value: 'lead.created',
						description: 'Triggers when a new lead is created',
					},
					{
						name: 'Lead Updated',
						value: 'lead.updated',
						description: 'Triggers when a lead is updated',
					},
					{
						name: 'Lead Deleted',
						value: 'lead.deleted',
						description: 'Triggers when a lead is deleted',
					},
					{
						name: 'Lead Status Changed',
						value: 'activity.lead_status_change.created',
						description: 'Triggers when a lead changes status',
					},
					{
						name: 'Opportunity Status Changed',
						value: 'activity.opportunity_status_change.created',
						description: 'Triggers when an opportunity changes status',
					},
					{
						name: 'Task Created',
						value: 'task.created',
						description: 'Triggers when a new task is created',
					},
					{
						name: 'Custom Activity Created',
						value: 'custom_activity.created',
						description: 'Triggers when a custom activity is created',
					},
				],
				default: ['lead.created'],
				required: true,
				description: 'The webhook events to listen for',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Verify Signature',
						name: 'verifySignature',
						type: 'boolean',
						default: true,
						description: 'Whether to verify the webhook signature for security',
					},
					{
						displayName: 'Idempotency Check',
						name: 'idempotencyCheck',
						type: 'boolean',
						default: true,
						description: 'Whether to check for duplicate events using event_id',
					},
				],
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

				const credentials = await this.getCredentials('closeApi');
				if (!credentials || !credentials.apiKey) {
					return false;
				}

				try {
					await closeApiRequest.call(
						this,
						'GET',
						`/webhook/${webhookData.webhookId}/`,
					);
					return true;
				} catch {
					return false;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const events = this.getNodeParameter('events') as string[];
				const webhookData = this.getWorkflowStaticData('node');

				// Transform event selections to Close API format
				const eventPayloads: IDataObject[] = [];

				for (const event of events) {
					const [objectType, action] = event.split('.');

					// Handle special cases for activity events
					if (objectType === 'activity') {
						const [, activityType, activityAction] = event.split('.');
						eventPayloads.push({
							object_type: `activity.${activityType}`,
							action: activityAction,
						});
					} else {
						eventPayloads.push({
							object_type: objectType,
							action: action,
						});
					}
				}

				const body: IDataObject = {
					url: webhookUrl,
					events: eventPayloads,
				};

				try {
					const response = await closeApiRequest.call(
						this,
						'POST',
						'/webhook/',
						body,
					);

					if (response.id === undefined || response.signature_key === undefined) {
						throw new NodeApiError(this.getNode(), {
							message: 'Failed to create webhook subscription',
							description: 'The Close API did not return a webhook ID or signature key',
						});
					}

					webhookData.webhookId = response.id as string;
					webhookData.signatureKey = response.signature_key as string;
					webhookData.processedEventIds = webhookData.processedEventIds || [];

					return true;
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as any);
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId === undefined) {
					return true;
				}

				try {
					await closeApiRequest.call(
						this,
						'DELETE',
						`/webhook/${webhookData.webhookId}/`,
					);
				} catch {
					return false;
				}

				// Clean up webhook data
				delete webhookData.webhookId;
				delete webhookData.signatureKey;
				delete webhookData.processedEventIds;

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const webhookData = this.getWorkflowStaticData('node');
		const req = this.getRequestObject();
		const additionalOptions = this.getNodeParameter('additionalOptions', {}) as IDataObject;

		const verifySignature = additionalOptions.verifySignature !== false;
		const idempotencyCheck = additionalOptions.idempotencyCheck !== false;

		// Verify webhook signature
		if (verifySignature) {
			const signatureKey = webhookData.signatureKey as string;

			if (!signatureKey) {
				throw new NodeOperationError(
					this.getNode(),
					'Webhook signature key is missing. Please reactivate the workflow.',
				);
			}

			const timestamp = req.headers['close-sig-timestamp'] as string;
			const receivedSignature = req.headers['close-sig-hash'] as string;

			if (!timestamp || !receivedSignature) {
				throw new NodeOperationError(
					this.getNode(),
					'Missing webhook signature headers',
				);
			}

			// Verify the signature
			const payload = JSON.stringify(req.body);
			const expectedSignature = crypto
				.createHmac('sha256', signatureKey)
				.update(`${timestamp}.${payload}`)
				.digest('hex');

			if (expectedSignature !== receivedSignature) {
				throw new NodeOperationError(
					this.getNode(),
					'Invalid webhook signature',
				);
			}

			// Check timestamp to prevent replay attacks (5 minutes tolerance)
			const currentTime = Math.floor(Date.now() / 1000);
			const receivedTime = parseInt(timestamp, 10);

			if (Math.abs(currentTime - receivedTime) > 300) {
				throw new NodeOperationError(
					this.getNode(),
					'Webhook timestamp is too old or invalid',
				);
			}
		}

		const eventData = req.body as IDataObject;

		// Idempotency check
		if (idempotencyCheck) {
			const eventId = eventData.event_id as string;

			if (eventId) {
				const processedEventIds = (webhookData.processedEventIds as string[]) || [];

				if (processedEventIds.includes(eventId)) {
					// Duplicate event, ignore it
					return {
						workflowData: [[]],
					};
				}

				// Store event ID (keep only last 1000 to prevent memory issues)
				processedEventIds.push(eventId);
				if (processedEventIds.length > 1000) {
					processedEventIds.shift();
				}
				webhookData.processedEventIds = processedEventIds;
			}
		}

		// Add metadata to the event
		const enrichedData: IDataObject = {
			...eventData,
			webhook_metadata: {
				received_at: new Date().toISOString(),
				webhook_url: this.getNodeWebhookUrl('default'),
				signature_verified: verifySignature,
			},
		};

		return {
			workflowData: [this.helpers.returnJsonArray([enrichedData])],
		};
	}
}
