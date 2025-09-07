import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	JsonObject,
	NodeConnectionType,
} from 'n8n-workflow';

import { NodeOperationError } from 'n8n-workflow';

import { closeApiRequest, closeApiRequestAllItems } from './GenericFunctions';

import { leadFields, leadOperations } from './descriptions/LeadDescription';

import { leadStatusFields, leadStatusOperations } from './descriptions/LeadStatusDescription';

import { opportunityFields, opportunityOperations } from './descriptions/OpportunityDescription';

import {
	opportunityStatusFields,
	opportunityStatusOperations,
} from './descriptions/OpportunityStatusDescription';

import { taskFields, taskOperations } from './descriptions/TaskDescription';

import { noteFields, noteOperations } from './descriptions/NoteDescription';

import { callFields, callOperations } from './descriptions/CallDescription';

import { emailFields, emailOperations } from './descriptions/EmailDescription';

import { meetingFields, meetingOperations } from './descriptions/MeetingDescription';

import { smsFields, smsOperations } from './descriptions/SmsDescription';

import {
	customActivityFields,
	customActivityOperations,
} from './descriptions/CustomActivityDescription';

export class Close implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Close CRM',
		name: 'close',
		icon: 'file:close.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume Close CRM API',
		defaults: {
			name: 'Close CRM',
		},
		inputs: [{ type: 'main' as NodeConnectionType }],
		outputs: [{ type: 'main' as NodeConnectionType }],
		credentials: [
			{
				name: 'closeApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Lead',
						value: 'lead',
					},
					{
						name: 'Lead Status',
						value: 'leadStatus',
					},
					{
						name: 'Opportunity',
						value: 'opportunity',
					},
					{
						name: 'Opportunity Status',
						value: 'opportunityStatus',
					},
					{
						name: 'Task',
						value: 'task',
					},
					{
						name: 'Note',
						value: 'note',
					},
					{
						name: 'Call',
						value: 'call',
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
						name: 'SMS',
						value: 'sms',
					},
					{
						name: 'Task',
						value: 'task',
					},
					{
						name: 'Custom Activity',
						value: 'customActivity',
					},
				],
				default: 'lead',
			},
			...leadOperations,
			...leadFields,
			...leadStatusOperations,
			...leadStatusFields,
			...opportunityOperations,
			...opportunityFields,
			...opportunityStatusOperations,
			...opportunityStatusFields,
			...taskOperations,
			...taskFields,
			...noteOperations,
			...noteFields,
			...callOperations,
			...callFields,
			...emailOperations,
			...emailFields,
			...meetingOperations,
			...meetingFields,
			...smsOperations,
			...smsFields,
			...customActivityOperations,
			...customActivityFields,
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

			async getCustomFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const fields = await closeApiRequest.call(this, 'GET', '/custom_field/lead/');
				for (const field of fields.data) {
					// Include field type in the description for user clarity
					const fieldTypeLabel =
						field.type === 'choices' ? ' (Dropdown)' : ` (${field.type || 'Text'})`;
					returnData.push({
						name: `${field.name}${fieldTypeLabel}`,
						value: `${field.id}|${field.type || 'text'}`, // Encode type in value
					});
				}
				return returnData;
			},

			async getCustomFieldChoices(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const fieldIdWithType = this.getCurrentNodeParameter('fieldId') as string;
				if (!fieldIdWithType) {
					return [];
				}

				// Parse the encoded field ID and type
				const [fieldId, fieldType] = fieldIdWithType.split('|');

				if (fieldType !== 'choices') {
					return [];
				}

				try {
					const field = await closeApiRequest.call(this, 'GET', `/custom_field/lead/${fieldId}/`);

					if (field.type === 'choices' && field.choices && Array.isArray(field.choices)) {
						return field.choices.map((choice: string) => ({
							name: choice,
							value: choice,
						}));
					}
				} catch (error) {
					// If field details can't be fetched, return empty array
					return [];
				}

				return [];
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		const qs: JsonObject = {};
		let responseData;

		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < length; i++) {
			try {
				// Input validation
				if (!resource) {
					throw new NodeOperationError(this.getNode(), 'Resource is required');
				}
				if (!operation) {
					throw new NodeOperationError(this.getNode(), 'Operation is required');
				}
				if (resource === 'lead') {
					if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						if (!name) {
							throw new NodeOperationError(
								this.getNode(),
								'Lead name is required for create operation',
							);
						}

						const body: JsonObject = {
							name,
						};

						// Add additional fields if provided
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						if (additionalFields.description) {
							body.description = additionalFields.description;
						}
						if (additionalFields.statusId) {
							body.status_id = additionalFields.statusId;
						}
						if (additionalFields.url) {
							body.url = additionalFields.url;
						}

						// Add contacts if provided
						const contacts = this.getNodeParameter('contactsUi', i) as {
							contactsValues?: Array<{
								name?: string;
								email?: string;
								phone?: string;
								title?: string;
							}>;
						};

						if (contacts.contactsValues?.length) {
							body.contacts = contacts.contactsValues.map((contact) => {
								const contactObj: JsonObject = {};
								if (contact.name) contactObj.name = contact.name;
								if (contact.email) contactObj.emails = [{ type: 'office', email: contact.email }];
								if (contact.phone) contactObj.phones = [{ type: 'office', phone: contact.phone }];
								if (contact.title) contactObj.title = contact.title;
								return contactObj;
							});
						}

						// Add custom fields if provided
						const customFields = this.getNodeParameter('customFieldsUi', i) as {
							customFieldsValues?: Array<{
								fieldId: string;
								fieldValue?: string;
								fieldValueChoice?: string;
							}>;
						};

						if (customFields.customFieldsValues?.length) {
							for (const field of customFields.customFieldsValues) {
								// Parse the encoded field ID and type
								const [actualFieldId, fieldType] = field.fieldId.split('|');

								// Use the appropriate value based on field type
								const value = fieldType === 'choices' ? field.fieldValueChoice : field.fieldValue;
								if (value) {
									body[`custom.${actualFieldId}`] = value;
								}
							}
						}

						responseData = await closeApiRequest.call(this, 'POST', '/lead/', body);
					}

					if (operation === 'delete') {
						const leadId = this.getNodeParameter('leadId', i) as string;
						if (!leadId) {
							throw new NodeOperationError(
								this.getNode(),
								'Lead ID is required for delete operation',
							);
						}

						responseData = await closeApiRequest.call(this, 'DELETE', `/lead/${leadId}/`);
					}

					if (operation === 'find') {
						const query = this.getNodeParameter('query', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i);
						const smartViewId = this.getNodeParameter('smartViewId', i, '') as string;
						const statusId = this.getNodeParameter('statusId', i, '') as string;

						if (query) {
							qs.query = query;
						}
						if (smartViewId) {
							qs.saved_search_id = smartViewId;
						}
						if (statusId) {
							qs.status_id = statusId;
						}

						if (returnAll) {
							responseData = await closeApiRequestAllItems.call(
								this,
								'data',
								'GET',
								'/lead/',
								{},
								qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i);
							qs._limit = limit;
							responseData = await closeApiRequest.call(this, 'GET', '/lead/', {}, qs);
							responseData = responseData.data;
						}
					}

					if (operation === 'merge') {
						const sourceLeadId = this.getNodeParameter('sourceLeadId', i) as string;
						const destinationLeadId = this.getNodeParameter('destinationLeadId', i) as string;

						if (!sourceLeadId) {
							throw new NodeOperationError(
								this.getNode(),
								'Source Lead ID is required for merge operation',
							);
						}
						if (!destinationLeadId) {
							throw new NodeOperationError(
								this.getNode(),
								'Destination Lead ID is required for merge operation',
							);
						}

						const body: JsonObject = {
							source: sourceLeadId,
							destination: destinationLeadId,
						};

						responseData = await closeApiRequest.call(this, 'POST', '/lead/merge/', body);
					}

					if (operation === 'update') {
						const leadId = this.getNodeParameter('leadId', i) as string;
						if (!leadId) {
							throw new NodeOperationError(
								this.getNode(),
								'Lead ID is required for update operation',
							);
						}
						const updateFields = this.getNodeParameter('updateFields', i) as JsonObject;

						const body: JsonObject = {};

						if (updateFields.name) {
							body.name = updateFields.name;
						}
						if (updateFields.description) {
							body.description = updateFields.description;
						}
						if (updateFields.statusId) {
							body.status_id = updateFields.statusId;
						}

						const customFields = this.getNodeParameter('customFieldsUi', i) as {
							customFieldsValues?: Array<{
								fieldId: string;
								fieldValue?: string;
								fieldValueChoice?: string;
							}>;
						};

						if (customFields.customFieldsValues?.length) {
							for (const field of customFields.customFieldsValues) {
								// Parse the encoded field ID and type
								const [actualFieldId, fieldType] = field.fieldId.split('|');

								// Use the appropriate value based on field type
								const value = fieldType === 'choices' ? field.fieldValueChoice : field.fieldValue;
								if (value) {
									body[`custom.${actualFieldId}`] = value;
								}
							}
						}

						responseData = await closeApiRequest.call(this, 'PUT', `/lead/${leadId}/`, body);
					}
				}

				if (resource === 'leadStatus') {
					if (operation === 'list') {
						responseData = await closeApiRequest.call(this, 'GET', '/status/lead/');
						responseData = responseData.data || responseData;
					}

					if (operation === 'create') {
						const label = this.getNodeParameter('label', i) as string;

						if (!label) {
							throw new NodeOperationError(
								this.getNode(),
								'Label is required for lead status creation',
							);
						}

						const body: JsonObject = {
							label,
						};

						// Add additional fields if provided
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						if (additionalFields.type) {
							body.type = additionalFields.type;
						}

						responseData = await closeApiRequest.call(this, 'POST', '/status/lead/', body);
					}

					if (operation === 'update') {
						const statusId = this.getNodeParameter('statusId', i) as string;
						const label = this.getNodeParameter('label', i) as string;

						if (!statusId) {
							throw new NodeOperationError(
								this.getNode(),
								'Status ID is required for update operation',
							);
						}
						if (!label) {
							throw new NodeOperationError(
								this.getNode(),
								'Label is required for update operation',
							);
						}

						const body: JsonObject = {
							label,
						};

						// Add additional fields if provided
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						if (additionalFields.type) {
							body.type = additionalFields.type;
						}

						responseData = await closeApiRequest.call(
							this,
							'PUT',
							`/status/lead/${statusId}/`,
							body,
						);
					}

					if (operation === 'delete') {
						const statusId = this.getNodeParameter('statusId', i) as string;

						if (!statusId) {
							throw new NodeOperationError(
								this.getNode(),
								'Status ID is required for delete operation',
							);
						}

						responseData = await closeApiRequest.call(this, 'DELETE', `/status/lead/${statusId}/`);
					}
				}

				if (resource === 'opportunity') {
					if (operation === 'create') {
						const leadId = this.getNodeParameter('leadId', i) as string;
						if (!leadId) {
							throw new NodeOperationError(
								this.getNode(),
								'Lead ID is required for opportunity creation',
							);
						}

						const body: JsonObject = {
							lead_id: leadId,
						};

						// Add additional fields if provided
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						if (additionalFields.statusId) {
							body.status_id = additionalFields.statusId;
						}
						if (additionalFields.note) {
							body.note = additionalFields.note;
						}
						if (additionalFields.value) {
							body.value = additionalFields.value;
						}
						if (additionalFields.valueFormatted) {
							body.value_formatted = additionalFields.valueFormatted;
						}

						responseData = await closeApiRequest.call(this, 'POST', '/opportunity/', body);
					}

					if (operation === 'delete') {
						const opportunityId = this.getNodeParameter('opportunityId', i) as string;
						if (!opportunityId) {
							throw new NodeOperationError(
								this.getNode(),
								'Opportunity ID is required for delete operation',
							);
						}

						responseData = await closeApiRequest.call(
							this,
							'DELETE',
							`/opportunity/${opportunityId}/`,
						);
					}

					if (operation === 'find') {
						const leadId = this.getNodeParameter('leadId', i, '') as string;
						const statusId = this.getNodeParameter('statusId', i, '') as string;
						const returnAll = this.getNodeParameter('returnAll', i);

						if (leadId) {
							qs.lead_id = leadId;
						}
						if (statusId) {
							qs.status_id = statusId;
						}

						if (returnAll) {
							responseData = await closeApiRequestAllItems.call(
								this,
								'data',
								'GET',
								'/opportunity/',
								{},
								qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i);
							qs._limit = limit;
							responseData = await closeApiRequest.call(this, 'GET', '/opportunity/', {}, qs);
							responseData = responseData.data;
						}
					}

					if (operation === 'update') {
						const opportunityId = this.getNodeParameter('opportunityId', i) as string;
						if (!opportunityId) {
							throw new NodeOperationError(
								this.getNode(),
								'Opportunity ID is required for update operation',
							);
						}
						const updateFields = this.getNodeParameter('updateFields', i) as JsonObject;

						const body: JsonObject = {};

						if (updateFields.statusId) {
							body.status_id = updateFields.statusId;
						}
						if (updateFields.note) {
							body.note = updateFields.note;
						}
						if (updateFields.value) {
							body.value = updateFields.value;
						}
						if (updateFields.valueFormatted) {
							body.value_formatted = updateFields.valueFormatted;
						}

						responseData = await closeApiRequest.call(
							this,
							'PUT',
							`/opportunity/${opportunityId}/`,
							body,
						);
					}
				}

				if (resource === 'opportunityStatus') {
					if (operation === 'list') {
						responseData = await closeApiRequest.call(this, 'GET', '/status/opportunity/');
						responseData = responseData.data || responseData;
					}

					if (operation === 'create') {
						const label = this.getNodeParameter('label', i) as string;
						const statusType = this.getNodeParameter('statusType', i) as string;

						if (!label) {
							throw new NodeOperationError(
								this.getNode(),
								'Label is required for opportunity status creation',
							);
						}
						if (!statusType) {
							throw new NodeOperationError(
								this.getNode(),
								'Status Type is required for opportunity status creation',
							);
						}

						const body: JsonObject = {
							label,
							status_type: statusType,
						};

						// Add additional fields if provided
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						if (additionalFields.pipelineId) {
							body.pipeline_id = additionalFields.pipelineId;
						}

						responseData = await closeApiRequest.call(this, 'POST', '/status/opportunity/', body);
					}

					if (operation === 'update') {
						const statusId = this.getNodeParameter('statusId', i) as string;
						const label = this.getNodeParameter('label', i) as string;

						if (!statusId) {
							throw new NodeOperationError(
								this.getNode(),
								'Status ID is required for update operation',
							);
						}
						if (!label) {
							throw new NodeOperationError(
								this.getNode(),
								'Label is required for update operation',
							);
						}

						const body: JsonObject = {
							label,
						};

						// Add additional fields if provided
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						if (additionalFields.statusType) {
							body.status_type = additionalFields.statusType;
						}
						if (additionalFields.pipelineId) {
							body.pipeline_id = additionalFields.pipelineId;
						}

						responseData = await closeApiRequest.call(
							this,
							'PUT',
							`/status/opportunity/${statusId}/`,
							body,
						);
					}

					if (operation === 'delete') {
						const statusId = this.getNodeParameter('statusId', i) as string;

						if (!statusId) {
							throw new NodeOperationError(
								this.getNode(),
								'Status ID is required for delete operation',
							);
						}

						responseData = await closeApiRequest.call(
							this,
							'DELETE',
							`/status/opportunity/${statusId}/`,
						);
					}
				}

				if (resource === 'task') {
					if (operation === 'create') {
						const leadId = this.getNodeParameter('leadId', i) as string;
						const text = this.getNodeParameter('text', i) as string;
						const date = this.getNodeParameter('date', i) as string;
						const assignedTo = this.getNodeParameter('assignedTo', i, '') as string;

						if (!leadId) {
							throw new NodeOperationError(this.getNode(), 'Lead ID is required for task creation');
						}
						if (!text) {
							throw new NodeOperationError(this.getNode(), 'Task text is required');
						}
						if (!date) {
							throw new NodeOperationError(this.getNode(), 'Task date is required');
						}

						const body: JsonObject = {
							lead_id: leadId,
							text,
							date,
						};

						if (assignedTo) {
							body.assigned_to = assignedTo;
						}

						responseData = await closeApiRequest.call(this, 'POST', '/task/', body);
					}

					if (operation === 'delete') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						if (!taskId) {
							throw new NodeOperationError(
								this.getNode(),
								'Task ID is required for delete operation',
							);
						}

						responseData = await closeApiRequest.call(this, 'DELETE', `/task/${taskId}/`);
					}

					if (operation === 'get') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						if (!taskId) {
							throw new NodeOperationError(this.getNode(), 'Task ID is required for get operation');
						}

						responseData = await closeApiRequest.call(this, 'GET', `/task/${taskId}/`);
					}

					if (operation === 'update') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						if (!taskId) {
							throw new NodeOperationError(
								this.getNode(),
								'Task ID is required for update operation',
							);
						}
						const updateFields = this.getNodeParameter('updateFields', i) as JsonObject;

						const body: JsonObject = {};

						if (updateFields.assignedTo) {
							body.assigned_to = updateFields.assignedTo;
						}
						if (updateFields.date) {
							body.date = updateFields.date;
						}
						if (updateFields.isComplete !== undefined) {
							body.is_complete = updateFields.isComplete;
						}
						if (updateFields.text) {
							body.text = updateFields.text;
						}

						responseData = await closeApiRequest.call(this, 'PUT', `/task/${taskId}/`, body);
					}

					if (operation === 'find') {
						const taskType = this.getNodeParameter('taskType', i) as string;
						const leadId = this.getNodeParameter('leadId', i, '') as string;
						const view = this.getNodeParameter('view', i, '') as string;
						const returnAll = this.getNodeParameter('returnAll', i);
						const additionalFilters = this.getNodeParameter('additionalFilters', i) as JsonObject;

						// Set task type filter
						if (taskType && taskType !== 'lead') {
							if (taskType === 'all') {
								qs._type = 'all';
							} else {
								qs._type = taskType;
							}
						}

						// Set lead filter
						if (leadId) {
							qs.lead_id = leadId;
						}

						// Set view filter
						if (view) {
							qs.view = view;
						}

						// Set additional filters
						if (additionalFilters.assignedTo) {
							qs.assigned_to = additionalFilters.assignedTo;
						}
						if (additionalFilters.dateGt) {
							qs.date__gt = additionalFilters.dateGt;
						}
						if (additionalFilters.dateGte) {
							qs.date__gte = additionalFilters.dateGte;
						}
						if (additionalFilters.dateLt) {
							qs.date__lt = additionalFilters.dateLt;
						}
						if (additionalFilters.dateLte) {
							qs.date__lte = additionalFilters.dateLte;
						}
						if (additionalFilters.dateCreatedGt) {
							qs.date_created__gt = additionalFilters.dateCreatedGt;
						}
						if (additionalFilters.dateCreatedGte) {
							qs.date_created__gte = additionalFilters.dateCreatedGte;
						}
						if (additionalFilters.dateCreatedLt) {
							qs.date_created__lt = additionalFilters.dateCreatedLt;
						}
						if (additionalFilters.dateCreatedLte) {
							qs.date_created__lte = additionalFilters.dateCreatedLte;
						}
						if (additionalFilters.isComplete !== undefined) {
							qs.is_complete = additionalFilters.isComplete;
						}
						if (additionalFilters.orderBy) {
							qs._order_by = additionalFilters.orderBy;
						}
						if (additionalFilters.taskIds) {
							qs.id__in = additionalFilters.taskIds;
						}

						if (returnAll) {
							responseData = await closeApiRequestAllItems.call(
								this,
								'data',
								'GET',
								'/task/',
								{},
								qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i);
							qs._limit = limit;
							responseData = await closeApiRequest.call(this, 'GET', '/task/', {}, qs);
							responseData = responseData.data;
						}
					}

					if (operation === 'bulkUpdate') {
						const bulkFilters = this.getNodeParameter('bulkFilters', i) as JsonObject;
						const bulkUpdateData = this.getNodeParameter('bulkUpdateData', i) as JsonObject;

						// Build query parameters for filtering tasks to update
						const queryParams: JsonObject = {};

						if (bulkFilters.taskIds) {
							queryParams.id__in = bulkFilters.taskIds;
						}
						if (bulkFilters.taskType) {
							queryParams._type = bulkFilters.taskType;
						}
						if (bulkFilters.leadId) {
							queryParams.lead_id = bulkFilters.leadId;
						}
						if (bulkFilters.isComplete !== undefined) {
							queryParams.is_complete = bulkFilters.isComplete;
						}
						if (bulkFilters.assignedTo) {
							queryParams.assigned_to = bulkFilters.assignedTo;
						}

						// Build update body (only allowed fields: assigned_to, date, is_complete)
						const body: JsonObject = {};

						if (bulkUpdateData.assignedTo) {
							body.assigned_to = bulkUpdateData.assignedTo;
						}
						if (bulkUpdateData.date) {
							body.date = bulkUpdateData.date;
						}
						if (bulkUpdateData.isComplete !== undefined) {
							body.is_complete = bulkUpdateData.isComplete;
						}

						if (Object.keys(body).length === 0) {
							throw new NodeOperationError(
								this.getNode(),
								'At least one update field must be provided for bulk update',
							);
						}

						responseData = await closeApiRequest.call(this, 'PUT', '/task/', body, queryParams);
					}
				}

				if (resource === 'note') {
					if (operation === 'create') {
						const leadId = this.getNodeParameter('leadId', i) as string;
						const noteContentType = this.getNodeParameter('noteContentType', i) as string;

						if (!leadId) {
							throw new NodeOperationError(this.getNode(), 'Lead ID is required for note creation');
						}

						const body: JsonObject = {
							lead_id: leadId,
							_type: 'Note',
						};

						// Handle note content based on type
						if (noteContentType === 'html') {
							const noteHtml = this.getNodeParameter('noteHtml', i) as string;
							if (!noteHtml) {
								throw new NodeOperationError(this.getNode(), 'Note HTML content is required');
							}
							body.note_html = noteHtml;
						} else {
							const note = this.getNodeParameter('note', i) as string;
							if (!note) {
								throw new NodeOperationError(this.getNode(), 'Note content is required');
							}
							body.note = note;
						}

						responseData = await closeApiRequest.call(this, 'POST', '/activity/note/', body);
					}

					if (operation === 'delete') {
						const noteId = this.getNodeParameter('noteId', i) as string;
						if (!noteId) {
							throw new NodeOperationError(
								this.getNode(),
								'Note ID is required for delete operation',
							);
						}

						responseData = await closeApiRequest.call(this, 'DELETE', `/activity/note/${noteId}/`);
					}

					if (operation === 'get') {
						const noteId = this.getNodeParameter('noteId', i) as string;
						if (!noteId) {
							throw new NodeOperationError(this.getNode(), 'Note ID is required for get operation');
						}

						responseData = await closeApiRequest.call(this, 'GET', `/activity/note/${noteId}/`);
					}

					if (operation === 'update') {
						const noteId = this.getNodeParameter('noteId', i) as string;
						const updateContentType = this.getNodeParameter('updateContentType', i) as string;

						if (!noteId) {
							throw new NodeOperationError(
								this.getNode(),
								'Note ID is required for update operation',
							);
						}

						const body: JsonObject = {};

						// Handle note content based on type
						if (updateContentType === 'html') {
							const noteHtml = this.getNodeParameter('noteHtml', i) as string;
							if (noteHtml) {
								body.note_html = noteHtml;
							}
						} else {
							const note = this.getNodeParameter('note', i) as string;
							if (note) {
								body.note = note;
							}
						}

						responseData = await closeApiRequest.call(
							this,
							'PUT',
							`/activity/note/${noteId}/`,
							body,
						);
					}

					if (operation === 'find') {
						const leadId = this.getNodeParameter('leadId', i, '') as string;
						const userId = this.getNodeParameter('userId', i, '') as string;
						const returnAll = this.getNodeParameter('returnAll', i);
						const additionalFilters = this.getNodeParameter('additionalFilters', i) as JsonObject;

						if (leadId) {
							qs.lead_id = leadId;
						}
						if (userId) {
							qs.user_id = userId;
						}
						if (additionalFilters.dateCreatedGt) {
							qs.date_created__gt = additionalFilters.dateCreatedGt;
						}
						if (additionalFilters.dateCreatedLt) {
							qs.date_created__lt = additionalFilters.dateCreatedLt;
						}

						if (returnAll) {
							responseData = await closeApiRequestAllItems.call(
								this,
								'data',
								'GET',
								'/activity/note/',
								{},
								qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i);
							qs._limit = limit;
							responseData = await closeApiRequest.call(this, 'GET', '/activity/note/', {}, qs);
							responseData = responseData.data;
						}
					}
				}

				if (resource === 'call') {
					if (operation === 'create') {
						const leadId = this.getNodeParameter('leadId', i) as string;
						if (!leadId) {
							throw new NodeOperationError(this.getNode(), 'Lead ID is required for call creation');
						}

						const body: JsonObject = {
							lead_id: leadId,
							_type: 'Call',
						};

						// Add additional fields if provided
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						if (additionalFields.direction) {
							body.direction = additionalFields.direction;
						}
						if (additionalFields.duration) {
							body.duration = additionalFields.duration;
						}
						if (additionalFields.noteHtml) {
							body.note_html = additionalFields.noteHtml;
						}
						if (additionalFields.note) {
							body.note = additionalFields.note;
						}
						if (additionalFields.phone) {
							body.phone = additionalFields.phone;
						}
						if (additionalFields.recordingUrl) {
							body.recording_url = additionalFields.recordingUrl;
						}
						if (additionalFields.status) {
							body.status = additionalFields.status;
						}

						responseData = await closeApiRequest.call(this, 'POST', '/activity/call/', body);
					}

					if (operation === 'delete') {
						const callId = this.getNodeParameter('callId', i) as string;
						if (!callId) {
							throw new NodeOperationError(
								this.getNode(),
								'Call ID is required for delete operation',
							);
						}

						responseData = await closeApiRequest.call(this, 'DELETE', `/activity/call/${callId}/`);
					}

					if (operation === 'get') {
						const callId = this.getNodeParameter('callId', i) as string;
						if (!callId) {
							throw new NodeOperationError(this.getNode(), 'Call ID is required for get operation');
						}

						responseData = await closeApiRequest.call(this, 'GET', `/activity/call/${callId}/`);
					}

					if (operation === 'update') {
						const callId = this.getNodeParameter('callId', i) as string;
						if (!callId) {
							throw new NodeOperationError(
								this.getNode(),
								'Call ID is required for update operation',
							);
						}
						const updateFields = this.getNodeParameter('updateFields', i) as JsonObject;

						const body: JsonObject = {};

						if (updateFields.noteHtml) {
							body.note_html = updateFields.noteHtml;
						}
						if (updateFields.note) {
							body.note = updateFields.note;
						}
						if (updateFields.outcomeId) {
							body.outcome_id = updateFields.outcomeId;
						}

						responseData = await closeApiRequest.call(
							this,
							'PUT',
							`/activity/call/${callId}/`,
							body,
						);
					}

					if (operation === 'find') {
						const leadId = this.getNodeParameter('leadId', i, '') as string;
						const returnAll = this.getNodeParameter('returnAll', i);

						if (leadId) {
							qs.lead_id = leadId;
						}
						qs._type = 'Call';

						if (returnAll) {
							responseData = await closeApiRequestAllItems.call(
								this,
								'data',
								'GET',
								'/activity/',
								{},
								qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i);
							qs._limit = limit;
							responseData = await closeApiRequest.call(this, 'GET', '/activity/', {}, qs);
							responseData = responseData.data;
						}
					}
				}

				if (resource === 'email') {
					if (operation === 'create') {
						const leadId = this.getNodeParameter('leadId', i) as string;
						const to = this.getNodeParameter('to', i) as string;
						const subject = this.getNodeParameter('subject', i) as string;
						const status = this.getNodeParameter('status', i) as string;

						if (!leadId) {
							throw new NodeOperationError(
								this.getNode(),
								'Lead ID is required for email creation',
							);
						}
						if (!to) {
							throw new NodeOperationError(
								this.getNode(),
								'To field is required for email creation',
							);
						}
						if (!subject) {
							throw new NodeOperationError(
								this.getNode(),
								'Subject is required for email creation',
							);
						}

						const body: JsonObject = {
							lead_id: leadId,
							to: [to],
							subject,
							status,
						};

						// Add additional fields if provided
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						if (additionalFields.bodyHtml) {
							body.body_html = additionalFields.bodyHtml;
						}
						if (additionalFields.bodyText) {
							body.body_text = additionalFields.bodyText;
						}
						if (additionalFields.cc) {
							body.cc = (additionalFields.cc as string)
								.split(',')
								.map((email: string) => email.trim());
						}
						if (additionalFields.bcc) {
							body.bcc = (additionalFields.bcc as string)
								.split(',')
								.map((email: string) => email.trim());
						}
						if (additionalFields.dateScheduled) {
							body.date_scheduled = additionalFields.dateScheduled;
						}
						if (additionalFields.followupDate) {
							body.followup_date = additionalFields.followupDate;
						}
						if (additionalFields.sendIn) {
							body.send_in = additionalFields.sendIn;
						}
						if (additionalFields.sender) {
							body.sender = additionalFields.sender;
						}
						if (additionalFields.templateId) {
							body.template_id = additionalFields.templateId;
						}

						responseData = await closeApiRequest.call(this, 'POST', '/activity/email/', body);
					}

					if (operation === 'delete') {
						const emailId = this.getNodeParameter('emailId', i) as string;
						if (!emailId) {
							throw new NodeOperationError(
								this.getNode(),
								'Email ID is required for delete operation',
							);
						}

						responseData = await closeApiRequest.call(
							this,
							'DELETE',
							`/activity/email/${emailId}/`,
						);
					}

					if (operation === 'get') {
						const emailId = this.getNodeParameter('emailId', i) as string;
						if (!emailId) {
							throw new NodeOperationError(
								this.getNode(),
								'Email ID is required for get operation',
							);
						}

						responseData = await closeApiRequest.call(this, 'GET', `/activity/email/${emailId}/`);
					}

					if (operation === 'update') {
						const emailId = this.getNodeParameter('emailId', i) as string;
						if (!emailId) {
							throw new NodeOperationError(
								this.getNode(),
								'Email ID is required for update operation',
							);
						}
						const updateFields = this.getNodeParameter('updateFields', i) as JsonObject;

						const body: JsonObject = {};

						if (updateFields.bodyHtml) {
							body.body_html = updateFields.bodyHtml;
						}
						if (updateFields.bodyText) {
							body.body_text = updateFields.bodyText;
						}
						if (updateFields.dateScheduled) {
							body.date_scheduled = updateFields.dateScheduled;
						}
						if (updateFields.status) {
							body.status = updateFields.status;
						}
						if (updateFields.subject) {
							body.subject = updateFields.subject;
						}

						responseData = await closeApiRequest.call(
							this,
							'PUT',
							`/activity/email/${emailId}/`,
							body,
						);
					}

					if (operation === 'find') {
						const leadId = this.getNodeParameter('leadId', i, '') as string;
						const returnAll = this.getNodeParameter('returnAll', i);

						if (leadId) {
							qs.lead_id = leadId;
						}

						if (returnAll) {
							responseData = await closeApiRequestAllItems.call(
								this,
								'data',
								'GET',
								'/activity/email/',
								{},
								qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i);
							qs._limit = limit;
							responseData = await closeApiRequest.call(this, 'GET', '/activity/email/', {}, qs);
							responseData = responseData.data;
						}
					}
				}

				if (resource === 'meeting') {
					if (operation === 'delete') {
						const meetingId = this.getNodeParameter('meetingId', i) as string;
						if (!meetingId) {
							throw new NodeOperationError(
								this.getNode(),
								'Meeting ID is required for delete operation',
							);
						}

						responseData = await closeApiRequest.call(
							this,
							'DELETE',
							`/activity/meeting/${meetingId}/`,
						);
					}

					if (operation === 'get') {
						const meetingId = this.getNodeParameter('meetingId', i) as string;
						if (!meetingId) {
							throw new NodeOperationError(
								this.getNode(),
								'Meeting ID is required for get operation',
							);
						}

						const additionalOptions = this.getNodeParameter('additionalOptions', i) as JsonObject;
						const params: JsonObject = {};

						if (additionalOptions.includeTranscripts) {
							params._fields = 'transcripts';
						}

						responseData = await closeApiRequest.call(
							this,
							'GET',
							`/activity/meeting/${meetingId}/`,
							{},
							params,
						);
					}

					if (operation === 'update') {
						const meetingId = this.getNodeParameter('meetingId', i) as string;
						if (!meetingId) {
							throw new NodeOperationError(
								this.getNode(),
								'Meeting ID is required for update operation',
							);
						}
						const updateFields = this.getNodeParameter('updateFields', i) as JsonObject;

						const body: JsonObject = {};

						if (updateFields.userNoteHtml) {
							body.user_note_html = updateFields.userNoteHtml;
						}
						if (updateFields.outcomeId) {
							body.outcome_id = updateFields.outcomeId;
						}

						responseData = await closeApiRequest.call(
							this,
							'PUT',
							`/activity/meeting/${meetingId}/`,
							body,
						);
					}

					if (operation === 'find') {
						const leadId = this.getNodeParameter('leadId', i, '') as string;
						const userId = this.getNodeParameter('userId', i, '') as string;
						const returnAll = this.getNodeParameter('returnAll', i);
						const additionalFilters = this.getNodeParameter('additionalFilters', i) as JsonObject;

						if (leadId) {
							qs.lead_id = leadId;
						}
						if (userId) {
							qs.user_id = userId;
						}
						if (additionalFilters.dateCreatedGt) {
							qs.date_created__gt = additionalFilters.dateCreatedGt;
						}
						if (additionalFilters.dateCreatedLt) {
							qs.date_created__lt = additionalFilters.dateCreatedLt;
						}

						if (returnAll) {
							responseData = await closeApiRequestAllItems.call(
								this,
								'data',
								'GET',
								'/activity/meeting/',
								{},
								qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i);
							qs._limit = limit;
							responseData = await closeApiRequest.call(this, 'GET', '/activity/meeting/', {}, qs);
							responseData = responseData.data;
						}
					}
				}

				if (resource === 'sms') {
					if (operation === 'create') {
						const leadId = this.getNodeParameter('leadId', i) as string;
						const to = this.getNodeParameter('to', i) as string;
						const localPhone = this.getNodeParameter('localPhone', i) as string;
						const status = this.getNodeParameter('status', i) as string;
						const text = this.getNodeParameter('text', i) as string;

						if (!leadId) {
							throw new NodeOperationError(this.getNode(), 'Lead ID is required for SMS creation');
						}
						if (!to) {
							throw new NodeOperationError(this.getNode(), 'To phone is required for SMS creation');
						}
						if (!localPhone) {
							throw new NodeOperationError(
								this.getNode(),
								'Local phone is required for SMS creation',
							);
						}

						const body: JsonObject = {
							lead_id: leadId,
							to: [to],
							local_phone: localPhone,
							status,
						};

						// Add text or template_id
						if (text) {
							body.text = text;
						}

						// Add additional fields if provided
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						if (additionalFields.dateScheduled) {
							body.date_scheduled = additionalFields.dateScheduled;
						}
						if (additionalFields.direction) {
							body.direction = additionalFields.direction;
						}
						if (additionalFields.sendIn) {
							body.send_in = additionalFields.sendIn;
						}
						if (additionalFields.templateId) {
							body.template_id = additionalFields.templateId;
							// Remove text if template is used
							delete body.text;
						}

						// Handle send_to_inbox query parameter
						const queryParams: JsonObject = {};
						if (additionalFields.sendToInbox && status === 'inbox') {
							queryParams.send_to_inbox = 'true';
						}

						responseData = await closeApiRequest.call(
							this,
							'POST',
							'/activity/sms/',
							body,
							queryParams,
						);
					}

					if (operation === 'delete') {
						const smsId = this.getNodeParameter('smsId', i) as string;
						if (!smsId) {
							throw new NodeOperationError(
								this.getNode(),
								'SMS ID is required for delete operation',
							);
						}

						responseData = await closeApiRequest.call(this, 'DELETE', `/activity/sms/${smsId}/`);
					}

					if (operation === 'get') {
						const smsId = this.getNodeParameter('smsId', i) as string;
						if (!smsId) {
							throw new NodeOperationError(this.getNode(), 'SMS ID is required for get operation');
						}

						responseData = await closeApiRequest.call(this, 'GET', `/activity/sms/${smsId}/`);
					}

					if (operation === 'update') {
						const smsId = this.getNodeParameter('smsId', i) as string;
						if (!smsId) {
							throw new NodeOperationError(
								this.getNode(),
								'SMS ID is required for update operation',
							);
						}
						const updateFields = this.getNodeParameter('updateFields', i) as JsonObject;

						const body: JsonObject = {};

						if (updateFields.dateScheduled) {
							body.date_scheduled = updateFields.dateScheduled;
						}
						if (updateFields.status) {
							body.status = updateFields.status;
						}
						if (updateFields.text) {
							body.text = updateFields.text;
						}

						responseData = await closeApiRequest.call(this, 'PUT', `/activity/sms/${smsId}/`, body);
					}

					if (operation === 'find') {
						const leadId = this.getNodeParameter('leadId', i, '') as string;
						const userId = this.getNodeParameter('userId', i, '') as string;
						const returnAll = this.getNodeParameter('returnAll', i);
						const additionalFilters = this.getNodeParameter('additionalFilters', i) as JsonObject;

						if (leadId) {
							qs.lead_id = leadId;
						}
						if (userId) {
							qs.user_id = userId;
						}
						if (additionalFilters.dateCreatedGt) {
							qs.date_created__gt = additionalFilters.dateCreatedGt;
						}
						if (additionalFilters.dateCreatedLt) {
							qs.date_created__lt = additionalFilters.dateCreatedLt;
						}

						if (returnAll) {
							responseData = await closeApiRequestAllItems.call(
								this,
								'data',
								'GET',
								'/activity/sms/',
								{},
								qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i);
							qs._limit = limit;
							responseData = await closeApiRequest.call(this, 'GET', '/activity/sms/', {}, qs);
							responseData = responseData.data;
						}
					}
				}

				if (resource === 'customActivity') {
					if (operation === 'getPublished') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const dateCreated = this.getNodeParameter('dateCreated', i, '') as string;

						qs._type = 'Custom';
						if (dateCreated) {
							qs.date_created__gte = dateCreated;
						}

						if (returnAll) {
							responseData = await closeApiRequestAllItems.call(
								this,
								'data',
								'GET',
								'/activity/',
								{},
								qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i);
							qs._limit = limit;
							responseData = await closeApiRequest.call(this, 'GET', '/activity/', {}, qs);
							responseData = responseData.data;
						}
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as JsonObject[]),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
