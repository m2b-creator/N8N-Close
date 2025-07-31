"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noteFields = exports.noteOperations = void 0;
exports.noteOperations = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['note'],
            },
        },
        options: [
            {
                name: 'Create',
                value: 'create',
                description: 'Create a note',
                action: 'Create a note',
            },
        ],
        default: 'create',
    },
];
exports.noteFields = [
    {
        displayName: 'Lead ID',
        name: 'leadId',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['note'],
                operation: ['create'],
            },
        },
        default: '',
        required: true,
        description: 'The ID of the lead to create the note for',
    },
    {
        displayName: 'Note',
        name: 'note',
        type: 'string',
        typeOptions: {
            rows: 4,
        },
        displayOptions: {
            show: {
                resource: ['note'],
                operation: ['create'],
            },
        },
        default: '',
        required: true,
        description: 'The content of the note',
    },
];
