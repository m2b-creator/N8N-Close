import type { INodeProperties } from 'n8n-workflow';

export const meetingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['meeting'],
			},
		},
		options: [
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a meeting activity',
				action: 'Delete a meeting',
			},
			{
				name: 'Find',
				value: 'find',
				description: 'Find meeting activities',
				action: 'Find meetings',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Fetch a single meeting activity',
				action: 'Get a meeting',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a meeting activity',
				action: 'Update a meeting',
			},
		],
		default: 'find',
	},
];

export const meetingFields: INodeProperties[] = [
	// Fields for Delete operation
	{
		displayName: 'Meeting ID',
		name: 'meetingId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['meeting'],
				operation: ['delete'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the meeting to delete',
	},
	// Fields for Get operation
	{
		displayName: 'Meeting ID',
		name: 'meetingId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['meeting'],
				operation: ['get'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the meeting to fetch',
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['meeting'],
				operation: ['get'],
			},
		},
		options: [
			{
				displayName: 'Include Transcripts',
				name: 'includeTranscripts',
				type: 'boolean',
				default: false,
				description: 'Whether to include meeting transcripts in the response',
			},
		],
	},
	// Fields for Update operation
	{
		displayName: 'Meeting ID',
		name: 'meetingId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['meeting'],
				operation: ['update'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the meeting to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['meeting'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'User Note',
				name: 'userNote',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Note about the meeting (will be converted to Portable Text format)',
			},
			{
				displayName: 'Outcome ID',
				name: 'outcomeId',
				type: 'string',
				default: '',
				description: 'Custom outcome ID for the meeting',
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
				resource: ['meeting'],
				operation: ['find'],
			},
		},
		default: '',
		description: 'Filter meetings by lead ID',
	},
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['meeting'],
				operation: ['find'],
			},
		},
		default: '',
		description: 'Filter meetings by user ID',
	},
	{
		displayName: 'Additional Filters',
		name: 'additionalFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['meeting'],
				operation: ['find'],
			},
		},
		options: [
			{
				displayName: 'Date Created (After)',
				name: 'dateCreatedGt',
				type: 'dateTime',
				default: '',
				description: 'Filter meetings created after this date',
			},
			{
				displayName: 'Date Created (Before)',
				name: 'dateCreatedLt',
				type: 'dateTime',
				default: '',
				description: 'Filter meetings created before this date',
			},
		],
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['meeting'],
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
				resource: ['meeting'],
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
