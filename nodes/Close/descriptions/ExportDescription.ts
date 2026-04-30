import type { INodeProperties } from 'n8n-workflow';

export const exportOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['export'],
			},
		},
		options: [
			{
				name: 'Export Leads',
				value: 'createLead',
				description: 'Start a lead export',
				action: 'Export leads',
			},
			{
				name: 'Export Opportunities',
				value: 'createOpportunity',
				description: 'Start an opportunity export',
				action: 'Export opportunities',
			},
			{
				name: 'Find',
				value: 'find',
				description: 'List recent exports',
				action: 'List exports',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Fetch a single export (use to poll status and retrieve download_url)',
				action: 'Get an export',
			},
		],
		default: 'createLead',
	},
];

const commonExportOptions: INodeProperties[] = [
	{
		displayName: 'Date Format',
		name: 'dateFormat',
		type: 'options',
		options: [
			{ name: 'Original', value: 'original' },
			{ name: 'ISO 8601', value: 'iso8601' },
			{ name: 'Excel', value: 'excel' },
		],
		default: 'original',
		description: 'How to format dates in CSV exports',
	},
	{
		displayName: 'Fields (Comma-Separated)',
		name: 'fields',
		type: 'string',
		default: '',
		description: 'Comma-separated list of fields to include. Leave empty to export all fields.',
	},
	{
		displayName: 'Include Activities',
		name: 'includeActivities',
		type: 'boolean',
		default: false,
		description: 'Whether to include activities (only with leads + JSON format)',
	},
	{
		displayName: 'Include Smart Fields',
		name: 'includeSmartFields',
		type: 'boolean',
		default: false,
		description: 'Whether to include calculated/smart fields like email count',
	},
	{
		displayName: 'Send Done Email',
		name: 'sendDoneEmail',
		type: 'boolean',
		default: true,
		description: 'Whether to receive a notification email once the export is finished',
	},
	{
		displayName: 'Results Limit',
		name: 'resultsLimit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 0,
		description: 'Max number of records to export. Leave 0 to disable.',
	},
];

export const exportFields: INodeProperties[] = [
	// ----- Get Export -----
	{
		displayName: 'Export ID',
		name: 'exportId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['export'],
				operation: ['get'],
			},
		},
		description: 'The ID of the export to fetch',
	},
	// ----- List Exports -----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['export'],
				operation: ['find'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		displayOptions: {
			show: {
				resource: ['export'],
				operation: ['find'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},

	// ----- Export Leads -----
	{
		displayName: 'Format',
		name: 'format',
		type: 'options',
		options: [
			{ name: 'CSV', value: 'csv' },
			{ name: 'JSON', value: 'json' },
		],
		default: 'csv',
		displayOptions: {
			show: {
				resource: ['export'],
				operation: ['createLead', 'createOpportunity'],
			},
		},
		description: 'File format of the exported data',
	},
	{
		displayName: 'Type',
		name: 'leadExportType',
		type: 'options',
		options: [
			{ name: 'Leads (One Row Per Lead)', value: 'leads' },
			{ name: 'Contacts (One Row Per Contact)', value: 'contacts' },
			{ name: 'Lead Opportunities (One Row Per Opportunity)', value: 'lead_opps' },
		],
		default: 'leads',
		displayOptions: {
			show: {
				resource: ['export'],
				operation: ['createLead'],
			},
		},
		description: 'Granularity of the lead export',
	},
	{
		displayName: 'Search Query (s_query JSON)',
		name: 'sQuery',
		type: 'json',
		default: '{}',
		displayOptions: {
			show: {
				resource: ['export'],
				operation: ['createLead'],
			},
		},
		description: 'Optional advanced filtering query object to narrow exported leads',
	},
	{
		displayName: 'Additional Fields',
		name: 'leadExportAdditionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['export'],
				operation: ['createLead'],
			},
		},
		options: commonExportOptions,
	},

	// ----- Export Opportunities -----
	{
		displayName: 'Params (JSON)',
		name: 'params',
		type: 'json',
		default: '{}',
		displayOptions: {
			show: {
				resource: ['export'],
				operation: ['createOpportunity'],
			},
		},
		description: 'Optional dictionary of filters used by the /opportunity/ endpoint',
	},
	{
		displayName: 'Additional Fields',
		name: 'opportunityExportAdditionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['export'],
				operation: ['createOpportunity'],
			},
		},
		options: [
			...commonExportOptions,
			{
				displayName: 'Include Addresses',
				name: 'includeAddresses',
				type: 'boolean',
				default: false,
				description: 'Whether to include addresses in the export',
			},
			{
				displayName: 'Include Custom Objects',
				name: 'includeCustomObjects',
				type: 'boolean',
				default: false,
				description: 'Whether to include custom objects in the export',
			},
		],
	},
];
