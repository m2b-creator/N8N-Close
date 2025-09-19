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
						description: 'Triggers when a lead enters a SmartView (first-time entry or re-entry after leaving). Does NOT trigger on updates to leads already in the SmartView.',
					},
					{
						name: 'New Lead in Status',
						value: 'newLeadInStatus',
						description: 'Triggers when a new lead is created with a specific status',
					},
					{
						name: 'Opportunity in new Status',
						value: 'opportunityInNewStatus',
						description: 'Triggers when an opportunity enters a new status',
					},
					{
						name: 'New Task',
						value: 'newTask',
						description: 'Triggers when a new task is created or completed',
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
				displayName: 'Smart View Name ',
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
				description: 'The SmartView to monitor for lead transitions. Only triggers when leads enter this SmartView (not on updates within SmartView). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'Status Name ',
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
				displayName: 'Opportunity Status Name ',
				name: 'opportunityStatusId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getOpportunityStatuses',
				},
				displayOptions: {
					show: {
						event: ['opportunityInNewStatus'],
					},
				},
				default: '',
				required: false,
				description: 'Monitor opportunities entering this specific status. Leave empty to monitor all status changes. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'Task Type',
				name: 'taskType',
				type: 'options',
				options: [
					{
						name: 'All Tasks',
						value: 'all',
						description: 'Monitor all tasks',
					},
					{
						name: 'New Tasks Only',
						value: 'new',
						description: 'Monitor only newly created tasks',
					},
					{
						name: 'Completed Tasks Only',
						value: 'completed',
						description: 'Monitor only completed tasks',
					},
				],
				displayOptions: {
					show: {
						event: ['newTask'],
					},
				},
				default: 'all',
				required: true,
				description: 'Type of task events to monitor',
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

			async getOpportunityStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const statuses = await closeApiRequest.call(this, 'GET', '/status/opportunity/');
				for (const status of statuses.data) {
					returnData.push({
						name: status.label,
						value: status.id,
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
		const smartViewId = this.getNodeParameter('smartViewId') as string;

		try {
			// First, fetch the SmartView definition to understand its criteria
			let smartViewDefinition: IDataObject;
			try {
				smartViewDefinition = await closeApiRequest.call(this, 'GET', `/saved_search/${smartViewId}/`);
			} catch (error) {
				throw new NodeApiError(this.getNode(), {
					message: `Failed to fetch SmartView definition: ${error}`,
					description: 'Please verify the SmartView ID is correct and accessible.'
				});
			}

			// Get current leads in the SmartView
			const smartViewQs: IDataObject = {
				_limit: 100,
				_order_by: '-date_updated',
			};

			// Use the SmartView query to get leads that currently match its criteria
			const smartViewResponse = await closeApiRequest.call(
				this,
				'GET',
				'/lead/',
				{},
				{ ...smartViewQs, saved_search_id: smartViewId }
			);

			const currentLeadsInSmartView = smartViewResponse.data || [];
			
			// Create a Set of current lead IDs for efficient lookup
			const currentLeadIds = new Set(currentLeadsInSmartView.map((lead: IDataObject) => lead.id as string));
			
			// Get the previous SmartView state from webhookData
			const previousLeadIds = new Set((webhookData.previousSmartViewLeads || []) as string[]);
			
			// Find leads that have entered the SmartView (transition detection)
			// A lead is "newly in SmartView" if:
			// 1. It's currently in the SmartView AND
			// 2. It was NOT in the SmartView during the previous poll
			const newlyEnteredLeads = currentLeadsInSmartView.filter((lead: IDataObject) => {
				const leadId = lead.id as string;
				return currentLeadIds.has(leadId) && !previousLeadIds.has(leadId);
			});

			// Store current state for next poll comparison
			webhookData.previousSmartViewLeads = Array.from(currentLeadIds);

			// Filter by time if we have a start date
			let filteredNewLeads = newlyEnteredLeads;
			if (startDate && newlyEnteredLeads.length > 0) {
				const lastCheckTime = new Date(startDate);
				
				filteredNewLeads = newlyEnteredLeads.filter((lead: IDataObject) => {
					const dateCreated = new Date(lead.date_created as string);
					const dateUpdated = new Date(lead.date_updated as string);
					
					// Include lead if it was created or updated since last check
					return dateCreated > lastCheckTime || dateUpdated > lastCheckTime;
				});
			}

			// Only set trigger information for leads that are actually in the SmartView
			for (const lead of filteredNewLeads) {
				// Double-check: only trigger if lead is actually in the current SmartView
				if (currentLeadIds.has(lead.id as string)) {
					lead.smartViewId = smartViewId;
					lead.smartViewName = smartViewDefinition.name || 'Unknown SmartView';
					lead.triggerReason = 'entered_smartview';
					lead.triggerTimestamp = new Date().toISOString();
					
					// Add metadata for debugging
					lead.metadata = {
						wasInPreviousState: previousLeadIds.has(lead.id as string),
						isInCurrentState: currentLeadIds.has(lead.id as string),
						lastPollingCheck: startDate,
						currentPollingCheck: endDate,
						totalLeadsInSmartView: currentLeadsInSmartView.length,
						totalNewlyEnteredLeads: filteredNewLeads.length
					};
				}
			}

			// Return only the most recent lead
			if (filteredNewLeads.length > 0) {
				filteredNewLeads.sort((a: IDataObject, b: IDataObject) => {
					const dateA = new Date(a.date_updated as string);
					const dateB = new Date(b.date_updated as string);
					return dateB.getTime() - dateA.getTime();
				});
				responseData = [filteredNewLeads[0]];
			} else {
				responseData = [];
			}

		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject);
		}
	}

	if (event === 'newLeadInStatus') {
		qs.status_id = this.getNodeParameter('statusId') as string;
		qs._limit = 1;
		
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

	if (event === 'opportunityInNewStatus') {
		const opportunityStatusId = this.getNodeParameter('opportunityStatusId') as string;
		qs._limit = 1;
		
		if (startDate) {
			qs.date_updated__gte = startDate;
		}

		if (opportunityStatusId) {
			qs.status_id = opportunityStatusId;
		}

		try {
			const response = await closeApiRequest.call(this, 'GET', '/opportunity/', {}, qs);
			responseData = response.data || [];
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject);
		}
	}

	if (event === 'newTask') {
		const taskType = this.getNodeParameter('taskType') as string;
		qs._limit = 1;
		
		if (startDate) {
			qs.date_created__gte = startDate;
		}

		if (taskType === 'new') {
			qs.is_complete = false;
		} else if (taskType === 'completed') {
			qs.is_complete = true;
		}

		try {
			const response = await closeApiRequest.call(this, 'GET', '/task/', {}, qs);
			responseData = response.data || [];
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject);
		}
	}

	if (event === 'publishedCustomActivity') {
		if (startDate) {
			qs.date_created__gte = startDate;
		}

		const customActivityTypeId = this.getNodeParameter('customActivityTypeId') as string;
		const userId = this.getNodeParameter('userId') as string;
		const contactId = this.getNodeParameter('contactId') as string;

		qs._order_by = '-date_created';
		qs._limit = 1;

		try {
			const response = await closeApiRequest.call(this, 'GET', '/activity/custom/', {}, qs);
			let activities = response.data || [];

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

			activities = activities.filter((activity: IDataObject) => {
				return activity.status !== 'draft' && activity.date_created;
			});

			for (const activity of activities) {
				if (activity.custom_activity_type_id) {
					try {
						const activityType = await closeApiRequest.call(
							this, 
							'GET', 
							`/custom_activity_type/${activity.custom_activity_type_id}/`
						);
						if (activityType && activityType.name) {
							activity.custom_activity_name = activityType.name;
						}
					} catch (error) {
						activity.custom_activity_name = 'Unknown Activity Type';
					}
				}
			}

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