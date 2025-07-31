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
                name: 'Get Published',
                value: 'getPublished',
                description: 'Get published custom activities',
                action: 'Get published custom activities',
            },
        ],
        default: 'getPublished',
    },
];
exports.customActivityFields = [
    {
        displayName: 'Date Created (Optional)',
        name: 'dateCreated',
        type: 'dateTime',
        displayOptions: {
            show: {
                resource: ['customActivity'],
                operation: ['getPublished'],
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
                operation: ['getPublished'],
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
