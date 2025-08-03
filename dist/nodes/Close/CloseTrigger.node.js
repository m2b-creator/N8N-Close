"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseTrigger = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const GenericFunctions_1 = require("./GenericFunctions");
class CloseTrigger {
    constructor() {
        this.description = {
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
            outputs: [{ type: 'main' }],
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
                    description: 'Filter by specific custom activity type ID. Leave empty to monitor all custom activities.',
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
                    description: 'Filter by specific user ID. Leave empty to monitor activities from all users.',
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
                    description: 'Filter by specific contact ID. Leave empty to monitor activities for all contacts.',
                },
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
    async poll() {
        const webhookData = this.getWorkflowStaticData('node');
        const event = this.getNodeParameter('event');
        let responseData = [];
        const qs = {};
        const now = new Date();
        const startDate = webhookData.lastTimeChecked;
        const endDate = now.toISOString();
        if (event === 'newLeadInSmartView') {
            const smartViewId = this.getNodeParameter('smartViewId');
            qs.saved_search_id = smartViewId;
            if (startDate) {
                qs.date_created__gte = startDate;
            }
            try {
                const response = await GenericFunctions_1.closeApiRequest.call(this, 'GET', '/lead/', {}, qs);
                responseData = response.data || [];
            }
            catch (error) {
                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
            }
        }
        if (event === 'newLeadInStatus') {
            const statusId = this.getNodeParameter('statusId');
            qs.status_id = statusId;
            if (startDate) {
                qs.date_created__gte = startDate;
            }
            try {
                const response = await GenericFunctions_1.closeApiRequest.call(this, 'GET', '/lead/', {}, qs);
                responseData = response.data || [];
            }
            catch (error) {
                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
            }
        }
        if (event === 'publishedCustomActivity') {
            if (startDate) {
                qs.date_created__gte = startDate;
            }
            // Add optional filters if provided
            const customActivityTypeId = this.getNodeParameter('customActivityTypeId');
            const userId = this.getNodeParameter('userId');
            const contactId = this.getNodeParameter('contactId');
            if (customActivityTypeId) {
                qs.custom_activity_type_id = customActivityTypeId;
            }
            if (userId) {
                qs.user_id = userId;
            }
            if (contactId) {
                qs.contact_id = contactId;
            }
            try {
                const response = await GenericFunctions_1.closeApiRequest.call(this, 'GET', '/activity/custom/', {}, qs);
                responseData = response.data || [];
            }
            catch (error) {
                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
            }
        }
        webhookData.lastTimeChecked = endDate;
        if (Array.isArray(responseData) && responseData.length) {
            return [this.helpers.returnJsonArray(responseData)];
        }
        return null;
    }
}
exports.CloseTrigger = CloseTrigger;
