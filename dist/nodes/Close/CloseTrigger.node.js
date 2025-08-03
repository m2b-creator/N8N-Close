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
            qs.saved_search_id = this.getNodeParameter('smartViewId');
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
            qs.status_id = this.getNodeParameter('statusId');
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
            // Get optional filter parameters
            const customActivityTypeId = this.getNodeParameter('customActivityTypeId');
            const userId = this.getNodeParameter('userId');
            const contactId = this.getNodeParameter('contactId');
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
            qs._limit = 50;
            try {
                const response = await GenericFunctions_1.closeApiRequest.call(this, 'GET', '/activity/custom/', {}, qs);
                let activities = response.data || [];
                // Apply client-side filtering to overcome API limitations
                if (customActivityTypeId) {
                    activities = activities.filter((activity) => activity.custom_activity_type_id === customActivityTypeId);
                }
                if (userId) {
                    activities = activities.filter((activity) => activity.user_id === userId);
                }
                if (contactId) {
                    activities = activities.filter((activity) => activity.contact_id === contactId);
                }
                // Filter for published activities only
                // Published activities should have a status of 'published' or be completed
                activities = activities.filter((activity) => {
                    // Check if activity is published/completed
                    // Close CRM custom activities are considered "published" when they're created and visible
                    // We filter out any activities that might be in draft state
                    return activity.status !== 'draft' && activity.date_created;
                });
                responseData = activities;
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
