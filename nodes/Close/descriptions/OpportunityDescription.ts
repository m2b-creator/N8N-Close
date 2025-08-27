import type { INodeProperties } from 'n8n-workflow';

export const opportunityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['opportunity'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new opportunity',
				action: 'Create an opportunity',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an opportunity',
				action: 'Delete an opportunity',
			},
			{
				name: 'Find',
				value: 'find',
				description: 'Find opportunities',
				action: 'Find opportunities',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an opportunity',
				action: 'Update an opportunity',
			},
		],
		default: 'find',
	},
];

export const opportunityFields: INodeProperties[] = [
	// Fields for Create operation
	{
		displayName: 'Lead ID',
		name: 'leadId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['opportunity'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the lead to create the opportunity for',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['opportunity'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Status Name or ID',
				name: 'statusId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getOpportunityStatuses',
				},
				default: '',
				description:
					'The status of the opportunity. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				default: '',
				description: 'Note about the opportunity',
			},
			{
				displayName: 'Value',
				name: 'value',
				type: 'number',
				default: 0,
				description: 'The value of the opportunity in cents',
			},
			{
				displayName: 'Value Formatted',
				name: 'valueFormatted',
				type: 'string',
				default: '',
				description: 'The formatted value of the opportunity',
			},
		],
	},
	// Fields for Delete operation
	{
		displayName: 'Opportunity ID',
		name: 'opportunityId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['opportunity'],
				operation: ['delete'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the opportunity to delete',
	},
	// Fields for Find operation
	{
		displayName: 'Lead ID',
		name: 'leadId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['opportunity'],
				operation: ['find'],
			},
		},
		default: '',
		description: 'Filter opportunities by lead ID',
	},
	{
		displayName: 'Status Name or ID',
		name: 'statusId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getOpportunityStatuses',
		},
		displayOptions: {
			show: {
				resource: ['opportunity'],
				operation: ['find'],
			},
		},
		default: '',
		description:
			'Filter opportunities by status. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['opportunity'],
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
				resource: ['opportunity'],
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
	// Fields for Update operation
	{
		displayName: 'Opportunity ID',
		name: 'opportunityId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['opportunity'],
				operation: ['update'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the opportunity to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['opportunity'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Status Name or ID',
				name: 'statusId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getOpportunityStatuses',
				},
				default: '',
				description:
					'The status of the opportunity. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				default: '',
				description: 'Note about the opportunity',
			},
			{
				displayName: 'Value',
				name: 'value',
				type: 'number',
				default: 0,
				description: 'The value of the opportunity in cents',
			},
			{
				displayName: 'Value Formatted',
				name: 'valueFormatted',
				type: 'string',
				default: '',
				description: 'The formatted value of the opportunity',
			},
		],
	},
];
