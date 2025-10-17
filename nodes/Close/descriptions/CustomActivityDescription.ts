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
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['customActivity'],
				operation: ['create'],
			},
		},
		options: [
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
				default: 'published',
				description: 'The status of the activity. Use "draft" to create without all required fields.',
			},
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
				default: '',
				description: 'Notes or description for this activity',
			},
			{
				displayName: 'Custom Fields',
				name: 'customFieldsUi',
				placeholder: 'Add Custom Field',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'customFieldsValues',
						displayName: 'Custom Field',
						values: [
							{
								displayName: 'Field ID',
								name: 'fieldId',
								type: 'string',
								default: '',
								description: 'The custom field ID (e.g., "cf_xxxx")',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'The value for this custom field',
							},
						],
					},
				],
			},
		],
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
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['customActivity'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Lead ID',
				name: 'leadId',
				type: 'string',
				default: '',
				description: 'The ID of the lead',
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
				default: 'published',
				description: 'The status of the activity',
			},
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
				default: '',
				description: 'Notes or description for this activity',
			},
			{
				displayName: 'Custom Fields',
				name: 'customFieldsUi',
				placeholder: 'Add Custom Field',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'customFieldsValues',
						displayName: 'Custom Field',
						values: [
							{
								displayName: 'Field ID',
								name: 'fieldId',
								type: 'string',
								default: '',
								description: 'The custom field ID (e.g., "cf_xxxx")',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'The value for this custom field',
							},
						],
					},
				],
			},
		],
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