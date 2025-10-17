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
				name: 'Create',
				value: 'create',
				description: 'Create a new custom activity',
				action: 'Create a custom activity',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a custom activity',
				action: 'Delete a custom activity',
			},
			{
				name: 'Find',
				value: 'find',
				description: 'Find custom activities',
				action: 'Find custom activities',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a custom activity',
				action: 'Get a custom activity',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a custom activity',
				action: 'Update a custom activity',
			},
		],
		default: 'find',
	},
];;

export const customActivityFields: INodeProperties[] = [
	// CREATE OPERATION FIELDS
	{
		displayName: 'Lead ID',
		name: 'leadId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['customActivity'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the lead to create the activity for',
	},
	{
		displayName: 'Custom Activity Type Name or ID',
		name: 'customActivityTypeId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getCustomActivityTypes',
		},
		displayOptions: {
			show: {
				resource: ['customActivity'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description:
			'The type of custom activity to create. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{
				name: 'Draft',
				value: 'draft',
			},
			{
				name: 'Published',
				value: 'published',
			},
		],
		displayOptions: {
			show: {
				resource: ['customActivity'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The status of the activity (optional). Use "draft" to create without all required fields.',
	},

	// UPDATE OPERATION FIELDS
	{
		displayName: 'Activity ID',
		name: 'activityId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['customActivity'],
				operation: ['update'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the custom activity to update',
	},
	{
		displayName: 'Custom Activity Type Name or ID',
		name: 'customActivityTypeId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getCustomActivityTypes',
		},
		displayOptions: {
			show: {
				resource: ['customActivity'],
				operation: ['update'],
			},
		},
		default: '',
		description:
			'The type of custom activity. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{
				name: 'Draft',
				value: 'draft',
			},
			{
				name: 'Published',
				value: 'published',
			},
		],
		displayOptions: {
			show: {
				resource: ['customActivity'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'The status of the activity (optional)',
	},

	// GET OPERATION FIELDS
	{
		displayName: 'Activity ID',
		name: 'activityId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['customActivity'],
				operation: ['get'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the custom activity to retrieve',
	},

	// DELETE OPERATION FIELDS
	{
		displayName: 'Activity ID',
		name: 'activityId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['customActivity'],
				operation: ['delete'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the custom activity to delete',
	},

	// FIND OPERATION FIELDS
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
		displayName: 'Custom Activity Type Name or ID',
		name: 'customActivityTypeId',
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
		description:
			'Filter by custom activity type. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
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
];;