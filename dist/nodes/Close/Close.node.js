"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Close = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const GenericFunctions_1 = require("./GenericFunctions");
const LeadDescription_1 = require("./descriptions/LeadDescription");
const LeadStatusDescription_1 = require("./descriptions/LeadStatusDescription");
const OpportunityDescription_1 = require("./descriptions/OpportunityDescription");
const OpportunityStatusDescription_1 = require("./descriptions/OpportunityStatusDescription");
const TaskDescription_1 = require("./descriptions/TaskDescription");
const NoteDescription_1 = require("./descriptions/NoteDescription");
const CallDescription_1 = require("./descriptions/CallDescription");
const EmailDescription_1 = require("./descriptions/EmailDescription");
const MeetingDescription_1 = require("./descriptions/MeetingDescription");
const SmsDescription_1 = require("./descriptions/SmsDescription");
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
                ...LeadDescription_1.leadOperations,
                ...LeadDescription_1.leadFields,
                ...LeadStatusDescription_1.leadStatusOperations,
                ...LeadStatusDescription_1.leadStatusFields,
                ...OpportunityDescription_1.opportunityOperations,
                ...OpportunityDescription_1.opportunityFields,
                ...OpportunityStatusDescription_1.opportunityStatusOperations,
                ...OpportunityStatusDescription_1.opportunityStatusFields,
                ...TaskDescription_1.taskOperations,
                ...TaskDescription_1.taskFields,
                ...NoteDescription_1.noteOperations,
                ...NoteDescription_1.noteFields,
                ...CallDescription_1.callOperations,
                ...CallDescription_1.callFields,
                ...EmailDescription_1.emailOperations,
                ...EmailDescription_1.emailFields,
                ...MeetingDescription_1.meetingOperations,
                ...MeetingDescription_1.meetingFields,
                ...SmsDescription_1.smsOperations,
                ...SmsDescription_1.smsFields,
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
        var _a, _b, _c;
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
                    if (operation === 'create') {
                        const name = this.getNodeParameter('name', i);
                        if (!name) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Lead name is required for create operation');
                        }
                        const body = {
                            name,
                        };
                        // Add additional fields if provided
                        const additionalFields = this.getNodeParameter('additionalFields', i);
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
                        const contacts = this.getNodeParameter('contactsUi', i);
                        if ((_a = contacts.contactsValues) === null || _a === void 0 ? void 0 : _a.length) {
                            body.contacts = contacts.contactsValues.map((contact) => {
                                const contactObj = {};
                                if (contact.name)
                                    contactObj.name = contact.name;
                                if (contact.email)
                                    contactObj.emails = [{ type: 'office', email: contact.email }];
                                if (contact.phone)
                                    contactObj.phones = [{ type: 'office', phone: contact.phone }];
                                if (contact.title)
                                    contactObj.title = contact.title;
                                return contactObj;
                            });
                        }
                        // Add custom fields if provided
                        const customFields = this.getNodeParameter('customFieldsUi', i);
                        if ((_b = customFields.customFieldsValues) === null || _b === void 0 ? void 0 : _b.length) {
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
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'POST', '/lead/', body);
                    }
                    if (operation === 'delete') {
                        const leadId = this.getNodeParameter('leadId', i);
                        if (!leadId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Lead ID is required for delete operation');
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'DELETE', `/lead/${leadId}/`);
                    }
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
                    if (operation === 'merge') {
                        const sourceLeadId = this.getNodeParameter('sourceLeadId', i);
                        const destinationLeadId = this.getNodeParameter('destinationLeadId', i);
                        if (!sourceLeadId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Source Lead ID is required for merge operation');
                        }
                        if (!destinationLeadId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Destination Lead ID is required for merge operation');
                        }
                        const body = {
                            source: sourceLeadId,
                            destination: destinationLeadId,
                        };
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'POST', '/lead/merge/', body);
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
                        if ((_c = customFields.customFieldsValues) === null || _c === void 0 ? void 0 : _c.length) {
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
                if (resource === 'leadStatus') {
                    if (operation === 'list') {
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'GET', '/status/lead/');
                        responseData = responseData.data || responseData;
                    }
                    if (operation === 'create') {
                        const label = this.getNodeParameter('label', i);
                        if (!label) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Label is required for lead status creation');
                        }
                        const body = {
                            label,
                        };
                        // Add additional fields if provided
                        const additionalFields = this.getNodeParameter('additionalFields', i);
                        if (additionalFields.type) {
                            body.type = additionalFields.type;
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'POST', '/status/lead/', body);
                    }
                    if (operation === 'update') {
                        const statusId = this.getNodeParameter('statusId', i);
                        const label = this.getNodeParameter('label', i);
                        if (!statusId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Status ID is required for update operation');
                        }
                        if (!label) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Label is required for update operation');
                        }
                        const body = {
                            label,
                        };
                        // Add additional fields if provided
                        const additionalFields = this.getNodeParameter('additionalFields', i);
                        if (additionalFields.type) {
                            body.type = additionalFields.type;
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'PUT', `/status/lead/${statusId}/`, body);
                    }
                    if (operation === 'delete') {
                        const statusId = this.getNodeParameter('statusId', i);
                        if (!statusId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Status ID is required for delete operation');
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'DELETE', `/status/lead/${statusId}/`);
                    }
                }
                if (resource === 'opportunity') {
                    if (operation === 'create') {
                        const leadId = this.getNodeParameter('leadId', i);
                        if (!leadId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Lead ID is required for opportunity creation');
                        }
                        const body = {
                            lead_id: leadId,
                        };
                        // Add additional fields if provided
                        const additionalFields = this.getNodeParameter('additionalFields', i);
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
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'POST', '/opportunity/', body);
                    }
                    if (operation === 'delete') {
                        const opportunityId = this.getNodeParameter('opportunityId', i);
                        if (!opportunityId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Opportunity ID is required for delete operation');
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'DELETE', `/opportunity/${opportunityId}/`);
                    }
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
                if (resource === 'opportunityStatus') {
                    if (operation === 'list') {
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'GET', '/status/opportunity/');
                        responseData = responseData.data || responseData;
                    }
                    if (operation === 'create') {
                        const label = this.getNodeParameter('label', i);
                        const statusType = this.getNodeParameter('statusType', i);
                        if (!label) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Label is required for opportunity status creation');
                        }
                        if (!statusType) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Status Type is required for opportunity status creation');
                        }
                        const body = {
                            label,
                            status_type: statusType,
                        };
                        // Add additional fields if provided
                        const additionalFields = this.getNodeParameter('additionalFields', i);
                        if (additionalFields.pipelineId) {
                            body.pipeline_id = additionalFields.pipelineId;
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'POST', '/status/opportunity/', body);
                    }
                    if (operation === 'update') {
                        const statusId = this.getNodeParameter('statusId', i);
                        const label = this.getNodeParameter('label', i);
                        if (!statusId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Status ID is required for update operation');
                        }
                        if (!label) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Label is required for update operation');
                        }
                        const body = {
                            label,
                        };
                        // Add additional fields if provided
                        const additionalFields = this.getNodeParameter('additionalFields', i);
                        if (additionalFields.statusType) {
                            body.status_type = additionalFields.statusType;
                        }
                        if (additionalFields.pipelineId) {
                            body.pipeline_id = additionalFields.pipelineId;
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'PUT', `/status/opportunity/${statusId}/`, body);
                    }
                    if (operation === 'delete') {
                        const statusId = this.getNodeParameter('statusId', i);
                        if (!statusId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Status ID is required for delete operation');
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'DELETE', `/status/opportunity/${statusId}/`);
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
                    if (operation === 'delete') {
                        const taskId = this.getNodeParameter('taskId', i);
                        if (!taskId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Task ID is required for delete operation');
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'DELETE', `/task/${taskId}/`);
                    }
                    if (operation === 'get') {
                        const taskId = this.getNodeParameter('taskId', i);
                        if (!taskId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Task ID is required for get operation');
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'GET', `/task/${taskId}/`);
                    }
                    if (operation === 'update') {
                        const taskId = this.getNodeParameter('taskId', i);
                        if (!taskId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Task ID is required for update operation');
                        }
                        const updateFields = this.getNodeParameter('updateFields', i);
                        const body = {};
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
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'PUT', `/task/${taskId}/`, body);
                    }
                    if (operation === 'find') {
                        const taskType = this.getNodeParameter('taskType', i);
                        const leadId = this.getNodeParameter('leadId', i, '');
                        const view = this.getNodeParameter('view', i, '');
                        const returnAll = this.getNodeParameter('returnAll', i);
                        const additionalFilters = this.getNodeParameter('additionalFilters', i);
                        // Set task type filter
                        if (taskType && taskType !== 'lead') {
                            if (taskType === 'all') {
                                qs._type = 'all';
                            }
                            else {
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
                            responseData = await GenericFunctions_1.closeApiRequestAllItems.call(this, 'data', 'GET', '/task/', {}, qs);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            qs._limit = limit;
                            responseData = await GenericFunctions_1.closeApiRequest.call(this, 'GET', '/task/', {}, qs);
                            responseData = responseData.data;
                        }
                    }
                    if (operation === 'bulkUpdate') {
                        const bulkFilters = this.getNodeParameter('bulkFilters', i);
                        const bulkUpdateData = this.getNodeParameter('bulkUpdateData', i);
                        // Build query parameters for filtering tasks to update
                        const queryParams = {};
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
                        const body = {};
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
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'At least one update field must be provided for bulk update');
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'PUT', '/task/', body, queryParams);
                    }
                }
                if (resource === 'note') {
                    if (operation === 'create') {
                        const leadId = this.getNodeParameter('leadId', i);
                        const noteContentType = this.getNodeParameter('noteContentType', i);
                        if (!leadId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Lead ID is required for note creation');
                        }
                        const body = {
                            lead_id: leadId,
                            _type: 'Note',
                        };
                        // Handle note content based on type
                        if (noteContentType === 'html') {
                            const noteHtml = this.getNodeParameter('noteHtml', i);
                            if (!noteHtml) {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Note HTML content is required');
                            }
                            body.note_html = noteHtml;
                        }
                        else {
                            const note = this.getNodeParameter('note', i);
                            if (!note) {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Note content is required');
                            }
                            body.note = note;
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'POST', '/activity/note/', body);
                    }
                    if (operation === 'delete') {
                        const noteId = this.getNodeParameter('noteId', i);
                        if (!noteId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Note ID is required for delete operation');
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'DELETE', `/activity/note/${noteId}/`);
                    }
                    if (operation === 'get') {
                        const noteId = this.getNodeParameter('noteId', i);
                        if (!noteId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Note ID is required for get operation');
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'GET', `/activity/note/${noteId}/`);
                    }
                    if (operation === 'update') {
                        const noteId = this.getNodeParameter('noteId', i);
                        const updateContentType = this.getNodeParameter('updateContentType', i);
                        if (!noteId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Note ID is required for update operation');
                        }
                        const body = {};
                        // Handle note content based on type
                        if (updateContentType === 'html') {
                            const noteHtml = this.getNodeParameter('noteHtml', i);
                            if (noteHtml) {
                                body.note_html = noteHtml;
                            }
                        }
                        else {
                            const note = this.getNodeParameter('note', i);
                            if (note) {
                                body.note = note;
                            }
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'PUT', `/activity/note/${noteId}/`, body);
                    }
                    if (operation === 'find') {
                        const leadId = this.getNodeParameter('leadId', i, '');
                        const userId = this.getNodeParameter('userId', i, '');
                        const returnAll = this.getNodeParameter('returnAll', i);
                        const additionalFilters = this.getNodeParameter('additionalFilters', i);
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
                            responseData = await GenericFunctions_1.closeApiRequestAllItems.call(this, 'data', 'GET', '/activity/note/', {}, qs);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            qs._limit = limit;
                            responseData = await GenericFunctions_1.closeApiRequest.call(this, 'GET', '/activity/note/', {}, qs);
                            responseData = responseData.data;
                        }
                    }
                }
                if (resource === 'call') {
                    if (operation === 'create') {
                        const leadId = this.getNodeParameter('leadId', i);
                        if (!leadId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Lead ID is required for call creation');
                        }
                        const body = {
                            lead_id: leadId,
                            _type: 'Call',
                        };
                        // Add additional fields if provided
                        const additionalFields = this.getNodeParameter('additionalFields', i);
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
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'POST', '/activity/call/', body);
                    }
                    if (operation === 'delete') {
                        const callId = this.getNodeParameter('callId', i);
                        if (!callId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Call ID is required for delete operation');
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'DELETE', `/activity/call/${callId}/`);
                    }
                    if (operation === 'get') {
                        const callId = this.getNodeParameter('callId', i);
                        if (!callId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Call ID is required for get operation');
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'GET', `/activity/call/${callId}/`);
                    }
                    if (operation === 'update') {
                        const callId = this.getNodeParameter('callId', i);
                        if (!callId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Call ID is required for update operation');
                        }
                        const updateFields = this.getNodeParameter('updateFields', i);
                        const body = {};
                        if (updateFields.noteHtml) {
                            body.note_html = updateFields.noteHtml;
                        }
                        if (updateFields.note) {
                            body.note = updateFields.note;
                        }
                        if (updateFields.outcomeId) {
                            body.outcome_id = updateFields.outcomeId;
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'PUT', `/activity/call/${callId}/`, body);
                    }
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
                if (resource === 'email') {
                    if (operation === 'create') {
                        const leadId = this.getNodeParameter('leadId', i);
                        const to = this.getNodeParameter('to', i);
                        const subject = this.getNodeParameter('subject', i);
                        const status = this.getNodeParameter('status', i);
                        if (!leadId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Lead ID is required for email creation');
                        }
                        if (!to) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'To field is required for email creation');
                        }
                        if (!subject) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Subject is required for email creation');
                        }
                        const body = {
                            lead_id: leadId,
                            to: [to],
                            subject,
                            status,
                        };
                        // Add additional fields if provided
                        const additionalFields = this.getNodeParameter('additionalFields', i);
                        if (additionalFields.bodyHtml) {
                            body.body_html = additionalFields.bodyHtml;
                        }
                        if (additionalFields.bodyText) {
                            body.body_text = additionalFields.bodyText;
                        }
                        if (additionalFields.cc) {
                            body.cc = additionalFields.cc
                                .split(',')
                                .map((email) => email.trim());
                        }
                        if (additionalFields.bcc) {
                            body.bcc = additionalFields.bcc
                                .split(',')
                                .map((email) => email.trim());
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
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'POST', '/activity/email/', body);
                    }
                    if (operation === 'delete') {
                        const emailId = this.getNodeParameter('emailId', i);
                        if (!emailId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Email ID is required for delete operation');
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'DELETE', `/activity/email/${emailId}/`);
                    }
                    if (operation === 'get') {
                        const emailId = this.getNodeParameter('emailId', i);
                        if (!emailId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Email ID is required for get operation');
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'GET', `/activity/email/${emailId}/`);
                    }
                    if (operation === 'update') {
                        const emailId = this.getNodeParameter('emailId', i);
                        if (!emailId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Email ID is required for update operation');
                        }
                        const updateFields = this.getNodeParameter('updateFields', i);
                        const body = {};
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
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'PUT', `/activity/email/${emailId}/`, body);
                    }
                    if (operation === 'find') {
                        const leadId = this.getNodeParameter('leadId', i, '');
                        const returnAll = this.getNodeParameter('returnAll', i);
                        if (leadId) {
                            qs.lead_id = leadId;
                        }
                        if (returnAll) {
                            responseData = await GenericFunctions_1.closeApiRequestAllItems.call(this, 'data', 'GET', '/activity/email/', {}, qs);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            qs._limit = limit;
                            responseData = await GenericFunctions_1.closeApiRequest.call(this, 'GET', '/activity/email/', {}, qs);
                            responseData = responseData.data;
                        }
                    }
                }
                if (resource === 'meeting') {
                    if (operation === 'delete') {
                        const meetingId = this.getNodeParameter('meetingId', i);
                        if (!meetingId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Meeting ID is required for delete operation');
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'DELETE', `/activity/meeting/${meetingId}/`);
                    }
                    if (operation === 'get') {
                        const meetingId = this.getNodeParameter('meetingId', i);
                        if (!meetingId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Meeting ID is required for get operation');
                        }
                        const additionalOptions = this.getNodeParameter('additionalOptions', i);
                        const params = {};
                        if (additionalOptions.includeTranscripts) {
                            params._fields = 'transcripts';
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'GET', `/activity/meeting/${meetingId}/`, {}, params);
                    }
                    if (operation === 'update') {
                        const meetingId = this.getNodeParameter('meetingId', i);
                        if (!meetingId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Meeting ID is required for update operation');
                        }
                        const updateFields = this.getNodeParameter('updateFields', i);
                        const body = {};
                        if (updateFields.userNoteHtml) {
                            body.user_note_html = updateFields.userNoteHtml;
                        }
                        if (updateFields.outcomeId) {
                            body.outcome_id = updateFields.outcomeId;
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'PUT', `/activity/meeting/${meetingId}/`, body);
                    }
                    if (operation === 'find') {
                        const leadId = this.getNodeParameter('leadId', i, '');
                        const userId = this.getNodeParameter('userId', i, '');
                        const returnAll = this.getNodeParameter('returnAll', i);
                        const additionalFilters = this.getNodeParameter('additionalFilters', i);
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
                            responseData = await GenericFunctions_1.closeApiRequestAllItems.call(this, 'data', 'GET', '/activity/meeting/', {}, qs);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            qs._limit = limit;
                            responseData = await GenericFunctions_1.closeApiRequest.call(this, 'GET', '/activity/meeting/', {}, qs);
                            responseData = responseData.data;
                        }
                    }
                }
                if (resource === 'sms') {
                    if (operation === 'create') {
                        const leadId = this.getNodeParameter('leadId', i);
                        const to = this.getNodeParameter('to', i);
                        const localPhone = this.getNodeParameter('localPhone', i);
                        const status = this.getNodeParameter('status', i);
                        const text = this.getNodeParameter('text', i);
                        if (!leadId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Lead ID is required for SMS creation');
                        }
                        if (!to) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'To phone is required for SMS creation');
                        }
                        if (!localPhone) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Local phone is required for SMS creation');
                        }
                        const body = {
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
                        const additionalFields = this.getNodeParameter('additionalFields', i);
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
                        const queryParams = {};
                        if (additionalFields.sendToInbox && status === 'inbox') {
                            queryParams.send_to_inbox = 'true';
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'POST', '/activity/sms/', body, queryParams);
                    }
                    if (operation === 'delete') {
                        const smsId = this.getNodeParameter('smsId', i);
                        if (!smsId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'SMS ID is required for delete operation');
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'DELETE', `/activity/sms/${smsId}/`);
                    }
                    if (operation === 'get') {
                        const smsId = this.getNodeParameter('smsId', i);
                        if (!smsId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'SMS ID is required for get operation');
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'GET', `/activity/sms/${smsId}/`);
                    }
                    if (operation === 'update') {
                        const smsId = this.getNodeParameter('smsId', i);
                        if (!smsId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'SMS ID is required for update operation');
                        }
                        const updateFields = this.getNodeParameter('updateFields', i);
                        const body = {};
                        if (updateFields.dateScheduled) {
                            body.date_scheduled = updateFields.dateScheduled;
                        }
                        if (updateFields.status) {
                            body.status = updateFields.status;
                        }
                        if (updateFields.text) {
                            body.text = updateFields.text;
                        }
                        responseData = await GenericFunctions_1.closeApiRequest.call(this, 'PUT', `/activity/sms/${smsId}/`, body);
                    }
                    if (operation === 'find') {
                        const leadId = this.getNodeParameter('leadId', i, '');
                        const userId = this.getNodeParameter('userId', i, '');
                        const returnAll = this.getNodeParameter('returnAll', i);
                        const additionalFilters = this.getNodeParameter('additionalFilters', i);
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
                            responseData = await GenericFunctions_1.closeApiRequestAllItems.call(this, 'data', 'GET', '/activity/sms/', {}, qs);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            qs._limit = limit;
                            responseData = await GenericFunctions_1.closeApiRequest.call(this, 'GET', '/activity/sms/', {}, qs);
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
