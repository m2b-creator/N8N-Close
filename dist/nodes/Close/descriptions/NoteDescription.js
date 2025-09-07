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
                description: 'Create a note activity',
                action: 'Create a note',
            },
            {
                name: 'Delete',
                value: 'delete',
                description: 'Delete a note activity',
                action: 'Delete a note',
            },
            {
                name: 'Find',
                value: 'find',
                description: 'Find note activities',
                action: 'Find notes',
            },
            {
                name: 'Get',
                value: 'get',
                description: 'Fetch a single note activity',
                action: 'Get a note',
            },
            {
                name: 'Update',
                value: 'update',
                description: 'Update a note activity',
                action: 'Update a note',
            },
        ],
        default: 'find',
    },
];
exports.noteFields = [
    // Fields for Create operation
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
        displayName: 'Note Content Type',
        name: 'noteContentType',
        type: 'options',
        displayOptions: {
            show: {
                resource: ['note'],
                operation: ['create'],
            },
        },
        options: [
            {
                name: 'HTML (Rich Text)',
                value: 'html',
                description: 'Rich-text content with HTML formatting',
            },
            {
                name: 'Plain Text',
                value: 'text',
                description: 'Plain text content only',
            },
        ],
        default: 'text',
        description: 'Choose whether to use HTML or plain text for the note content',
    },
    {
        displayName: 'Note (HTML)',
        name: 'noteHtml',
        type: 'string',
        typeOptions: {
            rows: 6,
        },
        displayOptions: {
            show: {
                resource: ['note'],
                operation: ['create'],
                noteContentType: ['html'],
            },
        },
        default: '',
        required: true,
        description: 'The HTML content of the note (supports rich-text formatting)',
    },
    {
        displayName: 'Note (Plain Text)',
        name: 'note',
        type: 'string',
        typeOptions: {
            rows: 6,
        },
        displayOptions: {
            show: {
                resource: ['note'],
                operation: ['create'],
                noteContentType: ['text'],
            },
        },
        default: '',
        required: true,
        description: 'The plain text content of the note',
    },
    // Fields for Delete operation
    {
        displayName: 'Note ID',
        name: 'noteId',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['note'],
                operation: ['delete'],
            },
        },
        default: '',
        required: true,
        description: 'The ID of the note to delete',
    },
    // Fields for Get operation
    {
        displayName: 'Note ID',
        name: 'noteId',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['note'],
                operation: ['get'],
            },
        },
        default: '',
        required: true,
        description: 'The ID of the note to fetch',
    },
    // Fields for Update operation
    {
        displayName: 'Note ID',
        name: 'noteId',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['note'],
                operation: ['update'],
            },
        },
        default: '',
        required: true,
        description: 'The ID of the note to update',
    },
    {
        displayName: 'Update Content Type',
        name: 'updateContentType',
        type: 'options',
        displayOptions: {
            show: {
                resource: ['note'],
                operation: ['update'],
            },
        },
        options: [
            {
                name: 'HTML (Rich Text)',
                value: 'html',
                description: 'Rich-text content with HTML formatting',
            },
            {
                name: 'Plain Text',
                value: 'text',
                description: 'Plain text content only',
            },
        ],
        default: 'text',
        description: 'Choose whether to update with HTML or plain text content',
    },
    {
        displayName: 'Note (HTML)',
        name: 'noteHtml',
        type: 'string',
        typeOptions: {
            rows: 6,
        },
        displayOptions: {
            show: {
                resource: ['note'],
                operation: ['update'],
                updateContentType: ['html'],
            },
        },
        default: '',
        description: 'The updated HTML content of the note (will overwrite plain text)',
    },
    {
        displayName: 'Note (Plain Text)',
        name: 'note',
        type: 'string',
        typeOptions: {
            rows: 6,
        },
        displayOptions: {
            show: {
                resource: ['note'],
                operation: ['update'],
                updateContentType: ['text'],
            },
        },
        default: '',
        description: 'The updated plain text content of the note (will overwrite HTML)',
    },
    // Fields for Find operation
    {
        displayName: 'Lead ID',
        name: 'leadId',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['note'],
                operation: ['find'],
            },
        },
        default: '',
        description: 'Filter notes by lead ID',
    },
    {
        displayName: 'User ID',
        name: 'userId',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['note'],
                operation: ['find'],
            },
        },
        default: '',
        description: 'Filter notes by user ID',
    },
    {
        displayName: 'Additional Filters',
        name: 'additionalFilters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
            show: {
                resource: ['note'],
                operation: ['find'],
            },
        },
        options: [
            {
                displayName: 'Date Created After',
                name: 'dateCreatedGt',
                type: 'dateTime',
                default: '',
                description: 'Filter notes created after this date',
            },
            {
                displayName: 'Date Created Before',
                name: 'dateCreatedLt',
                type: 'dateTime',
                default: '',
                description: 'Filter notes created before this date',
            },
        ],
    },
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['note'],
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
                resource: ['note'],
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
