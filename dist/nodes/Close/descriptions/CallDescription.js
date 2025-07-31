"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callFields = exports.callOperations = void 0;
exports.callOperations = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['call'],
            },
        },
        options: [
            {
                name: 'Find',
                value: 'find',
                description: 'Find calls',
                action: 'Find calls',
            },
        ],
        default: 'find',
    },
];
exports.callFields = [
    {
        displayName: 'Lead ID',
        name: 'leadId',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['call'],
                operation: ['find'],
            },
        },
        default: '',
        description: 'Filter calls by lead ID',
    },
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['call'],
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
                resource: ['call'],
                operation: ['find'],
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
