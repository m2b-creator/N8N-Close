import type { INodeProperties } from 'n8n-workflow';

export const smsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['sms'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create an SMS activity',
				action: 'Create an SMS',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an SMS activity',
				action: 'Delete an SMS',
			},
			{
				name: 'Find',
				value: 'find',
				description: 'Find SMS activities',
				action: 'Find SMS',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Fetch a single SMS activity',
				action: 'Get an SMS',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an SMS activity',
				action: 'Update an SMS',
			},
		],
		default: 'find',
	},
];

export const smsFields: INodeProperties[] = [
	// Fields for Create operation
	{
		displayName: 'Lead ID',
		name: 'leadId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the lead to create the SMS for',
	},
	{
		displayName: 'To Phone',
		name: 'to',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'Phone number to send the SMS to',
	},
	{
		displayName: 'Local Phone',
		name: 'localPhone',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description:
			'Phone number to send the SMS from (must be associated with a Phone Number of type internal)',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Draft',
				value: 'draft',
				description: 'Create a draft SMS',
			},
			{
				name: 'Inbox',
				value: 'inbox',
				description: 'Log an already received SMS',
			},
			{
				name: 'Outbox',
				value: 'outbox',
				description: 'Send the SMS immediately',
			},
			{
				name: 'Scheduled',
				value: 'scheduled',
				description: 'Schedule the SMS to be sent later',
			},
			{
				name: 'Sent',
				value: 'sent',
				description: 'Log an already sent SMS',
			},
		],
		default: 'draft',
		required: true,
		description: 'Status of the SMS',
	},
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The text content of the SMS',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Date Scheduled',
				name: 'dateScheduled',
				type: 'dateTime',
				default: '',
				description: 'Date and time to send the SMS (required if status is scheduled)',
			},
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
				description: 'Direction of the SMS',
			},
			{
				displayName: 'Send In (seconds)',
				name: 'sendIn',
				type: 'number',
				default: 0,
				typeOptions: {
					maxValue: 60,
					minValue: 0,
				},
				description: 'Delay SMS sending by seconds (max 60, for undo functionality)',
			},
			{
				displayName: 'Send to Inbox',
				name: 'sendToInbox',
				type: 'boolean',
				default: false,
				description:
					'Create a corresponding Inbox Notification for the SMS (only for inbox status)',
			},
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'string',
				default: '',
				description: 'SMS template ID to use (will render server-side)',
			},
		],
	},
	// Fields for Delete operation
	{
		displayName: 'SMS ID',
		name: 'smsId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['delete'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the SMS to delete',
	},
	// Fields for Get operation
	{
		displayName: 'SMS ID',
		name: 'smsId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['get'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the SMS to fetch',
	},
	// Fields for Update operation
	{
		displayName: 'SMS ID',
		name: 'smsId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['update'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the SMS to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Date Scheduled',
				name: 'dateScheduled',
				type: 'dateTime',
				default: '',
				description: 'Date and time to send the SMS',
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
						name: 'Outbox',
						value: 'outbox',
					},
					{
						name: 'Scheduled',
						value: 'scheduled',
					},
				],
				default: 'draft',
				description: 'Status of the SMS (only drafts can be modified)',
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'The text content of the SMS',
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
				resource: ['sms'],
				operation: ['find'],
			},
		},
		default: '',
		description: 'Filter SMS by lead ID',
	},
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['find'],
			},
		},
		default: '',
		description: 'Filter SMS by user ID',
	},
	{
		displayName: 'Additional Filters',
		name: 'additionalFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['find'],
			},
		},
		options: [
			{
				displayName: 'Date Created After',
				name: 'dateCreatedGt',
				type: 'dateTime',
				default: '',
				description: 'Filter SMS created after this date',
			},
			{
				displayName: 'Date Created Before',
				name: 'dateCreatedLt',
				type: 'dateTime',
				default: '',
				description: 'Filter SMS created before this date',
			},
		],
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['sms'],
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
				resource: ['sms'],
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
