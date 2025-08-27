import type { INodeProperties } from 'n8n-workflow';

export const leadStatusOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['leadStatus'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new lead status',
				action: 'Create a lead status',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a lead status',
				action: 'Delete a lead status',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all lead statuses for your organization',
				action: 'List lead statuses',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Rename a lead status',
				action: 'Update a lead status',
			},
		],
		default: 'list',
	},
];

export const leadStatusFields: INodeProperties[] = [
	// Fields for Create operation
	{
		displayName: 'Label',
		name: 'label',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['leadStatus'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'The label/name of the lead status',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['leadStatus'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{
						name: 'Active',
						value: 'active',
					},
					{
						name: 'Won',
						value: 'won',
					},
					{
						name: 'Lost',
						value: 'lost',
					},
				],
				default: 'active',
				description: 'The type of the lead status',
			},
		],
	},
	// Fields for Delete operation
	{
		displayName: 'Status ID',
		name: 'statusId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['leadStatus'],
				operation: ['delete'],
			},
		},
		default: '',
		required: true,
		description:
			'The ID of the lead status to delete. Make sure no leads are assigned this status first.',
	},
	// Fields for Update operation
	{
		displayName: 'Status ID',
		name: 'statusId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['leadStatus'],
				operation: ['update'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the lead status to update',
	},
	{
		displayName: 'Label',
		name: 'label',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['leadStatus'],
				operation: ['update'],
			},
		},
		default: '',
		required: true,
		description: 'The new label/name for the lead status',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['leadStatus'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{
						name: 'Active',
						value: 'active',
					},
					{
						name: 'Won',
						value: 'won',
					},
					{
						name: 'Lost',
						value: 'lost',
					},
				],
				default: 'active',
				description: 'The type of the lead status',
			},
		],
	},
];
