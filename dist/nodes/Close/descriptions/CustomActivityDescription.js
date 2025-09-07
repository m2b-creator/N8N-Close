"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customActivityFields = exports.customActivityOperations = void 0;
exports.customActivityOperations = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['customActivity'],
            },
        },
        options: [
            {
                name: 'Find',
                value: 'find',
                description: 'Find custom activities',
                action: 'Find custom activities',
            },
        ],
        default: 'find',
    },
];
exports.customActivityFields = [
    {
        displayName: 'Lead ID',
        name: 'leadId',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['customActivity'],
                operation: ['find'],
            },
        },
        default: '',
        description: 'Filter activities by lead ID',
    },
    {
        displayName: 'Search by Custom Activity ID',
        name: 'customActivityId',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['customActivity'],
                operation: ['find'],
            },
        },
        default: '',
        description: 'Search for a specific custom activity by ID',
    },
    {
        displayName: 'Date Created (Optional)',
        name: 'dateCreated',
        type: 'dateTime',
        displayOptions: {
            show: {
                resource: ['customActivity'],
                operation: ['find'],
            },
        },
        default: '',
        description: 'Filter activities created after this date',
    },
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['customActivity'],
                operation: ['find'],
            },
        },
        default: false,
        description: 'Whether to return all results or only up to a given limit',
    },
    {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        displayOptions: {
            show: {
                resource: ['customActivity'],
                operation: ['getPublished'],
                returnAll: [false],
            },
        },
        typeOptions: {
            minValue: 1,
        },
        default: 50,
        description: 'Max number of results to return',
    },
];
