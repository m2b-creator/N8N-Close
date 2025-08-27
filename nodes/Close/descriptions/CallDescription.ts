import type { INodeProperties } from 'n8n-workflow';

export const callOperations: INodeProperties[] = [
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
				name: 'Create',
				value: 'create',
				description: 'Log a call activity manually',
				action: 'Create a call',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a call activity',
				action: 'Delete a call',
			},
			{
				name: 'Find',
				value: 'find',
				description: 'Find calls',
				action: 'Find calls',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Fetch a single call activity',
				action: 'Get a call',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a call activity',
				action: 'Update a call',
			},
		],
		default: 'find',
	},
];

export const callFields: INodeProperties[] = [
	// Fields for Create operation
	{
		displayName: 'Lead ID',
		name: 'leadId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['call'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the lead to create the call for',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['call'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Direction',
				name: 'direction',
				type: 'options',
				options: [
					{
						name: 'Inbound',
						value: 'inbound',
					},
					{
						name: 'Outbound',
						value: 'outbound',
					},
				],
				default: 'outbound',
				description: 'The direction of the call',
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'number',
				default: 0,
				description: 'Duration of the call in seconds',
			},
			{
				displayName: 'Note (HTML)',
				name: 'noteHtml',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Rich-text note about the call (HTML format)',
			},
			{
				displayName: 'Note (Plain Text)',
				name: 'note',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Plain text note about the call',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Phone number that was called',
			},
			{
				displayName: 'Recording URL',
				name: 'recordingUrl',
				type: 'string',
				default: '',
				description: 'URL pointing to the MP3 recording (must be HTTPS)',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{
						name: 'Completed',
						value: 'completed',
					},
				],
				default: 'completed',
				description: 'Status of the call',
			},
		],
	},
	// Fields for Delete operation
	{
		displayName: 'Call ID',
		name: 'callId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['call'],
				operation: ['delete'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the call to delete',
	},
	// Fields for Get operation
	{
		displayName: 'Call ID',
		name: 'callId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['call'],
				operation: ['get'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the call to fetch',
	},
	// Fields for Update operation
	{
		displayName: 'Call ID',
		name: 'callId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['call'],
				operation: ['update'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the call to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['call'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Note (HTML)',
				name: 'noteHtml',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Rich-text note about the call (HTML format)',
			},
			{
				displayName: 'Note (Plain Text)',
				name: 'note',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Plain text note about the call',
			},
			{
				displayName: 'Outcome ID',
				name: 'outcomeId',
				type: 'string',
				default: '',
				description: 'Custom outcome ID for the call',
			},
		],
	},
	// Fields for Find operation
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