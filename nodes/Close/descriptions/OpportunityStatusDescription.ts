import type { INodeProperties } from 'n8n-workflow';

export const opportunityStatusOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['opportunityStatus'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new opportunity status',
				action: 'Create an opportunity status',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an opportunity status',
				action: 'Delete an opportunity status',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all opportunity statuses for your organization',
				action: 'List opportunity statuses',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Rename an opportunity status',
				action: 'Update an opportunity status',
			},
		],
		default: 'list',
	},
];

export const opportunityStatusFields: INodeProperties[] = [
	// Fields for Create operation
	{
		displayName: 'Label',
		name: 'label',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['opportunityStatus'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'The label/name of the opportunity status',
	},
	{
		displayName: 'Status Type',
		name: 'statusType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['opportunityStatus'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Active',
				value: 'active',
				description: 'Opportunity is still in progress',
			},
			{
				name: 'Won',
				value: 'won',
				description: 'Opportunity was closed successfully',
			},
			{
				name: 'Lost',
				value: 'lost',
				description: 'Opportunity was lost/closed unsuccessfully',
			},
		],
		default: 'active',
		required: true,
		description: 'The type of the opportunity status',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['opportunityStatus'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Pipeline ID',
				name: 'pipelineId',
				type: 'string',
				default: '',
				description: 'Create the opportunity status in a specific pipeline',
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
				resource: ['opportunityStatus'],
				operation: ['delete'],
			},
		},
		default: '',
		required: true,
		description:
			'The ID of the opportunity status to delete. Make sure no opportunities are assigned this status first.',
	},
	// Fields for Update operation
	{
		displayName: 'Status ID',
		name: 'statusId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['opportunityStatus'],
				operation: ['update'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the opportunity status to update',
	},
	{
		displayName: 'Label',
		name: 'label',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['opportunityStatus'],
				operation: ['update'],
			},
		},
		default: '',
		required: true,
		description: 'The new label/name for the opportunity status',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['opportunityStatus'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Status Type',
				name: 'statusType',
				type: 'options',
				options: [
					{
						name: 'Active',
						value: 'active',
						description: 'Opportunity is still in progress',
					},
					{
						name: 'Won',
						value: 'won',
						description: 'Opportunity was closed successfully',
					},
					{
						name: 'Lost',
						value: 'lost',
						description: 'Opportunity was lost/closed unsuccessfully',
					},
				],
				default: 'active',
				description: 'The type of the opportunity status',
			},
			{
				displayName: 'Pipeline ID',
				name: 'pipelineId',
				type: 'string',
				default: '',
				description: 'Move the opportunity status to a specific pipeline',
			},
		],
	},
];
