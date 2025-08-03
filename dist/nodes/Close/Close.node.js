"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Close = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const GenericFunctions_1 = require("./GenericFunctions");
const LeadDescription_1 = require("./descriptions/LeadDescription");
const OpportunityDescription_1 = require("./descriptions/OpportunityDescription");
const TaskDescription_1 = require("./descriptions/TaskDescription");
const NoteDescription_1 = require("./descriptions/NoteDescription");
const CallDescription_1 = require("./descriptions/CallDescription");
const CustomActivityDescription_1 = require("./descriptions/CustomActivityDescription");
class Close {
    constructor() {
        this.description = {
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
            inputs: [{ type: 'main' }],
            outputs: [{ type: 'main' }],
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
                ...LeadDescription_1.leadOperations,
                ...LeadDescription_1.leadFields,
                ...OpportunityDescription_1.opportunityOperations,
                ...OpportunityDescription_1.opportunityFields,
                ...TaskDescription_1.taskOperations,
                ...TaskDescription_1.taskFields,
                ...NoteDescription_1.noteOperations,
                ...NoteDescription_1.noteFields,
                ...CallDescription_1.callOperations,
                ...CallDescription_1.callFields,
                ...CustomActivityDescription_1.customActivityOperations,
                ...CustomActivityDescription_1.customActivityFields,
            ],
        };
        this.methods = {
            loadOptions: {
                async getLeadStatuses() {
                    const returnData = [];
                    const statuses = await GenericFunctions_1.closeApiRequest.call(this, 'GET', '/status/lead/');
                    for (const status of statuses.data) {
                        returnData.push({
                            name: status.label,
                            value: status.id,
                        });
                    }
                    return returnData;
                },
                async getOpportunityStatuses() {
                    const returnData = [];
                    const statuses = await GenericFunctions_1.closeApiRequest.call(this, 'GET', '/status/opportunity/');
                    for (const status of statuses.data) {
                        returnData.push({
                            name: status.label,
                            value: status.id,
                        });
                    }
                    return returnData;
                },
                async getCustomFields() {
                    const returnData = [];
                    const fields = await GenericFunctions_1.closeApiRequest.call(this, 'GET', '/custom_field/lead/');
                    for (const field of fields.data) {
                        // Include field type in the description for user clarity
                        const fieldTypeLabel = field.type === 'choices' ? ' (Dropdown)' : ` (${field.type || 'Text'})`;
                        returnData.push({
                            name: `${field.name}${fieldTypeLabel}`,
                            value: `${field.id}|${field.type || 'text'}`, // Encode type in value
                        });
                    }
                    return returnData;
                },
                async getCustomFieldChoices() {
                    const fieldIdWithType = this.getCurrentNodeParameter('fieldId');
                    if (!fieldIdWithType) {
                        return [];
                    }
                    // Parse the encoded field ID and type
                    const [fieldId, fieldType] = fieldIdWithType.split('|');
                    if (fieldType !== 'choices') {
                        return [];
                    }
                    try {
                        const field = await GenericFunctions_1.closeApiRequest.call(this, 'GET', `/custom_field/lead/${fieldId}/`);
                        if (field.type === 'choices' && field.choices && Array.isArray(field.choices)) {
                            return field.choices.map((choice) => ({
                                name: choice,
                                value: choice,
                            }));
                        }
                    }
                    catch (error) {
                        // If field details can't be fetched, return empty array
                        return [];
                    }
                    return [];
                },
                async getSmartViews() {
                    const returnData = [];
                    const views = await GenericFunctions_1.closeApiRequest.call(this, 'GET', '/saved_search/');
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
    }
    async execute() {
        var _a;
        const items = this.getInputData();
        const returnData = [];
        const length = items.length;
        const qs = {};
        let responseData;
        const resource = this.getNodeParameter('resource', 0);
        const operation = this.getNodeParameter('operation', 0);
        for (let i = 0; i < length; i++) {
            try {
                // Input validation
                if (!resource) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Resource is required');
                }
                if (!operation) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Operation is required');
                }
                if (resource === 'lead') {
                    if (operation === 'find') {
                        const query = this.getNodeParameter('query', i);
                        const returnAll = this.getNodeParameter('returnAll', i);
                        const smartViewId = this.getNodeParameter('smartViewId', i, '');
                        const statusId = this.getNodeParameter('statusId', i, '');
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
                            responseData = await GenericFunctions_1.closeApiRequestAllItems.call(this, 'data', 'GET', '/lead/', {}, qs);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            qs._limit = limit;
                            responseData = await GenericFunctions_1.closeApiRequest.call(this, 'GET', '/lead/', {}, qs);
                            responseData = responseData.data;
                        }
                    }
                    if (operation === 'update') {
                        const leadId = this.getNodeParameter('leadId', i);
                        if (!leadId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Lead ID is required for update operation');
                        }
                        const updateFields = this.getNodeParameter('updateFields', i);
                        const body = {};
                        if (updateFields.name) {
                            body.name = updateFields.name;
                        }
                        if (updateFields.description) {
                            body.description = updateFields.description;
                        }
                        if (updateFields.statusId) {
                            body.status_id = updateFields.statusId;
                        }
                        const customFields = this.getNodeParameter('customFieldsUi', i);
                        if ((_a = customFields.customFieldsValues) === null || _a === void 0 ? void 0 : _a.length) {
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
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'PUT', `/lead/${leadId}/`, body);
                    }
                }
                if (resource === 'opportunity') {
                    if (operation === 'find') {
                        const leadId = this.getNodeParameter('leadId', i, '');
                        const statusId = this.getNodeParameter('statusId', i, '');
                        const returnAll = this.getNodeParameter('returnAll', i);
                        if (leadId) {
                            qs.lead_id = leadId;
                        }
                        if (statusId) {
                            qs.status_id = statusId;
                        }
                        if (returnAll) {
                            responseData = await GenericFunctions_1.closeApiRequestAllItems.call(this, 'data', 'GET', '/opportunity/', {}, qs);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            qs._limit = limit;
                            responseData = await GenericFunctions_1.closeApiRequest.call(this, 'GET', '/opportunity/', {}, qs);
                            responseData = responseData.data;
                        }
                    }
                    if (operation === 'update') {
                        const opportunityId = this.getNodeParameter('opportunityId', i);
                        if (!opportunityId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Opportunity ID is required for update operation');
                        }
                        const updateFields = this.getNodeParameter('updateFields', i);
                        const body = {};
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
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'PUT', `/opportunity/${opportunityId}/`, body);
                    }
                }
                if (resource === 'task') {
                    if (operation === 'create') {
                        const leadId = this.getNodeParameter('leadId', i);
                        const text = this.getNodeParameter('text', i);
                        const date = this.getNodeParameter('date', i);
                        const assignedTo = this.getNodeParameter('assignedTo', i, '');
                        if (!leadId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Lead ID is required for task creation');
                        }
                        if (!text) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Task text is required');
                        }
                        if (!date) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Task date is required');
                        }
                        const body = {
                            lead_id: leadId,
                            text,
                            date,
                        };
                        if (assignedTo) {
                            body.assigned_to = assignedTo;
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'POST', '/task/', body);
                    }
                }
                if (resource === 'note') {
                    if (operation === 'create') {
                        const leadId = this.getNodeParameter('leadId', i);
                        const note = this.getNodeParameter('note', i);
                        if (!leadId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Lead ID is required for note creation');
                        }
                        if (!note) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Note content is required');
                        }
                        const body = {
                            lead_id: leadId,
                            note,
                            _type: 'Note',
                        };
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'POST', '/activity/note/', body);
                    }
                }
                if (resource === 'call') {
                    if (operation === 'find') {
                        const leadId = this.getNodeParameter('leadId', i, '');
                        const returnAll = this.getNodeParameter('returnAll', i);
                        if (leadId) {
                            qs.lead_id = leadId;
                        }
                        qs._type = 'Call';
                        if (returnAll) {
                            responseData = await GenericFunctions_1.closeApiRequestAllItems.call(this, 'data', 'GET', '/activity/', {}, qs);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            qs._limit = limit;
                            responseData = await GenericFunctions_1.closeApiRequest.call(this, 'GET', '/activity/', {}, qs);
                            responseData = responseData.data;
                        }
                    }
                }
                if (resource === 'customActivity') {
                    if (operation === 'getPublished') {
                        const returnAll = this.getNodeParameter('returnAll', i);
                        const dateCreated = this.getNodeParameter('dateCreated', i, '');
                        qs._type = 'Custom';
                        if (dateCreated) {
                            qs.date_created__gte = dateCreated;
                        }
                        if (returnAll) {
                            responseData = await GenericFunctions_1.closeApiRequestAllItems.call(this, 'data', 'GET', '/activity/', {}, qs);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            qs._limit = limit;
                            responseData = await GenericFunctions_1.closeApiRequest.call(this, 'GET', '/activity/', {}, qs);
                            responseData = responseData.data;
                        }
                    }
                }
                const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(responseData), { itemData: { item: i } });
                returnData.push(...executionData);
            }
            catch (error) {
                if (this.continueOnFail()) {
                    const executionErrorData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: error.message }), { itemData: { item: i } });
                    returnData.push(...executionErrorData);
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.Close = Close;
