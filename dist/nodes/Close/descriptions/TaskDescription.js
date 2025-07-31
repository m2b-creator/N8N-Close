"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskFields = exports.taskOperations = void 0;
exports.taskOperations = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['task'],
            },
        },
        options: [
            {
                name: 'Create',
                value: 'create',
                description: 'Create a task',
                action: 'Create a task',
            },
        ],
        default: 'create',
    },
];
exports.taskFields = [
    {
        displayName: 'Lead ID',
        name: 'leadId',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['task'],
                operation: ['create'],
            },
        },
        default: '',
        required: true,
        description: 'The ID of the lead to create the task for',
    },
    {
        displayName: 'Text',
        name: 'text',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['task'],
                operation: ['create'],
            },
        },
        default: '',
        required: true,
        description: 'The text content of the task',
    },
    {
        displayName: 'Date',
        name: 'date',
        type: 'dateTime',
        displayOptions: {
            show: {
                resource: ['task'],
                operation: ['create'],
            },
        },
        default: '',
        required: true,
        description: 'The date when the task should be actionable',
    },
    {
        displayName: 'Assigned To',
        name: 'assignedTo',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['task'],
                operation: ['create'],
            },
        },
        default: '',
        description: 'The user ID to assign the task to',
    },
];
