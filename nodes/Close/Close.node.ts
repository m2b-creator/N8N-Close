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

import { opportunityFields, opportunityOperations } from './descriptions/OpportunityDescription';

import { taskFields, taskOperations } from './descriptions/TaskDescription';

import { noteFields, noteOperations } from './descriptions/NoteDescription';

import { callFields, callOperations } from './descriptions/CallDescription';

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
						name: 'Opportunity',
						value: 'opportunity',
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
						name: 'Custom Activity',
						value: 'customActivity',
					},
				],
				default: 'lead',
			},
			...leadOperations,
			...leadFields,
			...opportunityOperations,
			...opportunityFields,
			...taskOperations,
			...taskFields,
			...noteOperations,
			...noteFields,
			...callOperations,
			...callFields,
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
				}

				if (resource === 'note') {
					if (operation === 'create') {
						const leadId = this.getNodeParameter('leadId', i) as string;
						const note = this.getNodeParameter('note', i) as string;

						if (!leadId) {
							throw new NodeOperationError(this.getNode(), 'Lead ID is required for note creation');
						}
						if (!note) {
							throw new NodeOperationError(this.getNode(), 'Note content is required');
						}

						const body: JsonObject = {
							lead_id: leadId,
							note,
							_type: 'Note',
						};

						responseData = await closeApiRequest.call(this, 'POST', '/activity/note/', body);
					}
				}

				if (resource === 'call') {
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
