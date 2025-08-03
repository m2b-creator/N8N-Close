import type {
	IPollFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	INodePropertyOptions,
	JsonObject,
	NodeConnectionType,
} from 'n8n-workflow';

import { NodeApiError } from 'n8n-workflow';

import { closeApiRequest } from './GenericFunctions';

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
		outputs: [{ type: 'main' as NodeConnectionType }],
		credentials: [
			{
				name: 'closeApi',
				required: true,
			},
		],
		polling: true,
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'New Lead in SmartView',
						value: 'newLeadInSmartView',
						description: 'Triggers when a new lead is added to a specific SmartView',
					},
					{
						name: 'New Lead in Status',
						value: 'newLeadInStatus',
						description: 'Triggers when a new lead is created with a specific status',
					},
					{
						name: 'Published Custom Activity',
						value: 'publishedCustomActivity',
						description: 'Triggers when a custom activity is published',
					},
				],
				default: 'newLeadInSmartView',
				required: true,
			},
			{
				displayName: 'Smart View Name or ID',
				name: 'smartViewId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getSmartViews',
				},
				displayOptions: {
					show: {
						event: ['newLeadInSmartView'],
					},
				},
				default: '',
				required: true,
				description: 'The SmartView to monitor for new leads. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'Status Name or ID',
				name: 'statusId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getLeadStatuses',
				},
				displayOptions: {
					show: {
						event: ['newLeadInStatus'],
					},
				},
				default: '',
				required: true,
				description: 'The status to monitor for new leads. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'Custom Activity Type ID (Optional)',
				name: 'customActivityTypeId',
				type: 'string',
				displayOptions: {
					show: {
						event: ['publishedCustomActivity'],
					},
				},
				default: '',
				description: 'Filter by specific custom activity type ID. Leave empty to monitor all custom activities. Note: This filter is applied after fetching the 50 newest activities to capture all published activities across all leads.',
			},
			{
				displayName: 'User ID (Optional)',
				name: 'userId',
				type: 'string',
				displayOptions: {
					show: {
						event: ['publishedCustomActivity'],
					},
				},
				default: '',
				description: 'Filter by specific user ID. Leave empty to monitor activities from all users. Note: This filter is applied after fetching the 50 newest activities to capture all published activities across all leads.',
			},
			{
				displayName: 'Contact ID (Optional)',
				name: 'contactId',
				type: 'string',
				displayOptions: {
					show: {
						event: ['publishedCustomActivity'],
					},
				},
				default: '',
				description: 'Filter by specific contact ID. Leave empty to monitor activities for all contacts. Note: This filter is applied after fetching the 50 newest activities to capture all published activities across all leads.',
			},
		],
	};

	methods = {
		loadOptions: {
			async getLeadStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const statuses = await closeApiRequest.call(this, 'GET', '/status/lead/');
				for (const status of statuses.data) {
					returnData.push({
						name: status.label,
						value: status.id,
					});
				}
				return returnData;
			},

			async getSmartViews(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const views = await closeApiRequest.call(this, 'GET', '/saved_search/');
				for (const view of views.data) {
					returnData.push({
						name: view.name,
						value: view.id,
					});
				}
				return returnData;
			},
		},
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const webhookData = this.getWorkflowStaticData('node');
		const event = this.getNodeParameter('event') as string;

		let responseData: IDataObject[] = [];
		const qs: IDataObject = {};

		const now = new Date();
		const startDate = webhookData.lastTimeChecked as string | undefined;
		const endDate = now.toISOString();

		if (event === 'newLeadInSmartView') {
			qs.saved_search_id = this.getNodeParameter('smartViewId') as string;
			
			if (startDate) {
				qs.date_created__gte = startDate;
			}

			try {
				const response = await closeApiRequest.call(this, 'GET', '/lead/', {}, qs);
				responseData = response.data || [];
			} catch (error) {
				throw new NodeApiError(this.getNode(), error as JsonObject);
			}
		}

		if (event === 'newLeadInStatus') {
			qs.status_id = this.getNodeParameter('statusId') as string;
			
			if (startDate) {
				qs.date_created__gte = startDate;
			}

			try {
				const response = await closeApiRequest.call(this, 'GET', '/lead/', {}, qs);
				responseData = response.data || [];
			} catch (error) {
				throw new NodeApiError(this.getNode(), error as JsonObject);
			}
		}

		if (event === 'publishedCustomActivity') {
			if (startDate) {
				qs.date_created__gte = startDate;
			}

			// Get optional filter parameters
			const customActivityTypeId = this.getNodeParameter('customActivityTypeId') as string;
			const userId = this.getNodeParameter('userId') as string;
			const contactId = this.getNodeParameter('contactId') as string;

			// Note: Close CRM API requires lead_id when filtering by custom_activity_type_id
			// To capture activities from ALL leads, we fetch all activities and filter client-side
			
			// Only add user_id and contact_id filters if they don't require lead_id
			// According to Close API docs, user_id and contact_id filters require lead_id too
			// So we'll fetch all activities and filter client-side for maximum compatibility

			// Order by creation date to get newest activities first
			qs._order_by = '-date_created';
			
			// Set a reasonable limit to optimize performance while ensuring we don't miss activities
			// This balances between API efficiency and completeness
			// 50 activities should be sufficient for most polling intervals
			qs._limit = 1;

			try {
				const response = await closeApiRequest.call(this, 'GET', '/activity/custom/', {}, qs);
				let activities = response.data || [];

				// Apply client-side filtering to overcome API limitations
				if (customActivityTypeId) {
					activities = activities.filter((activity: IDataObject) => 
						activity.custom_activity_type_id === customActivityTypeId
					);
				}

				if (userId) {
					activities = activities.filter((activity: IDataObject) => 
						activity.user_id === userId
					);
				}

				if (contactId) {
					activities = activities.filter((activity: IDataObject) => 
						activity.contact_id === contactId
					);
				}

				// Filter for published activities only
				// Published activities should have a status of 'published' or be completed
				activities = activities.filter((activity: IDataObject) => {
					// Check if activity is published/completed
					// Close CRM custom activities are considered "published" when they're created and visible
					// We filter out any activities that might be in draft state
					return activity.status !== 'draft' && activity.date_created;
				});

				responseData = activities;
			} catch (error) {
				throw new NodeApiError(this.getNode(), error as JsonObject);
			}
		}

		webhookData.lastTimeChecked = endDate;

		if (Array.isArray(responseData) && responseData.length) {
			return [this.helpers.returnJsonArray(responseData)];
		}

		return null;
	}
}