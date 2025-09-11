import type { INodeProperties } from 'n8n-workflow';

export const customActivityOperations: INodeProperties[] = [
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

export const customActivityFields: INodeProperties[] = [
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
		displayName: 'Search by Custom Activity',
		name: 'customActivityId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getCustomActivityTypes',
		},
		displayOptions: {
			show: {
				resource: ['customActivity'],
				operation: ['find'],
			},
		},
		default: '',
		description: 'Search for activities by custom activity type. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
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