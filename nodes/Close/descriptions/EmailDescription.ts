import type { INodeProperties } from 'n8n-workflow';

export const emailOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['email'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create an email activity',
				action: 'Create an email',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an email activity',
				action: 'Delete an email',
			},
			{
				name: 'Find',
				value: 'find',
				description: 'Find email activities',
				action: 'Find emails',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Fetch a single email activity',
				action: 'Get an email',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an email activity',
				action: 'Update an email',
			},
		],
		default: 'find',
	},
];

export const emailFields: INodeProperties[] = [
	// Fields for Create operation
	{
		displayName: 'Lead ID',
		name: 'leadId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the lead to create the email for',
	},
	{
		displayName: 'To',
		name: 'to',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'Email address of the recipient',
	},
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'Subject of the email',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Draft',
				value: 'draft',
				description: 'Create a draft email',
			},
			{
				name: 'Inbox',
				value: 'inbox',
				description: 'Log an already received email',
			},
			{
				name: 'Outbox',
				value: 'outbox',
				description: 'Send the email immediately',
			},
			{
				name: 'Scheduled',
				value: 'scheduled',
				description: 'Schedule the email to be sent later',
			},
			{
				name: 'Sent',
				value: 'sent',
				description: 'Log an already sent email',
			},
		],
		default: 'draft',
		required: true,
		description: 'Status of the email',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Body (HTML)',
				name: 'bodyHtml',
				type: 'string',
				typeOptions: {
					rows: 6,
				},
				default: '',
				description: 'HTML body of the email',
			},
			{
				displayName: 'Body (Text)',
				name: 'bodyText',
				type: 'string',
				typeOptions: {
					rows: 6,
				},
				default: '',
				description: 'Plain text body of the email',
			},
			{
				displayName: 'CC',
				name: 'cc',
				type: 'string',
				default: '',
				description: 'CC email addresses (comma-separated)',
			},
			{
				displayName: 'BCC',
				name: 'bcc',
				type: 'string',
				default: '',
				description: 'BCC email addresses (comma-separated)',
			},
			{
				displayName: 'Date Scheduled',
				name: 'dateScheduled',
				type: 'dateTime',
				default: '',
				description: 'Date and time to send the email (required if status is scheduled)',
			},
			{
				displayName: 'Followup Date',
				name: 'followupDate',
				type: 'dateTime',
				default: '',
				description: 'Date to create a followup task if no response is received',
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
				description: 'Delay email sending by seconds (max 60, for undo functionality)',
			},
			{
				displayName: 'Sender',
				name: 'sender',
				type: 'string',
				default: '',
				description: 'Sender name and email in format: "Name" <email@example.com>',
			},
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'string',
				default: '',
				description: 'Email template ID to use (will render server-side)',
			},
		],
	},
	// Fields for Delete operation
	{
		displayName: 'Email ID',
		name: 'emailId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['delete'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the email to delete',
	},
	// Fields for Get operation
	{
		displayName: 'Email ID',
		name: 'emailId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['get'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the email to fetch',
	},
	// Fields for Update operation
	{
		displayName: 'Email ID',
		name: 'emailId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['update'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the email to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Body (HTML)',
				name: 'bodyHtml',
				type: 'string',
				typeOptions: {
					rows: 6,
				},
				default: '',
				description: 'HTML body of the email',
			},
			{
				displayName: 'Body (Text)',
				name: 'bodyText',
				type: 'string',
				typeOptions: {
					rows: 6,
				},
				default: '',
				description: 'Plain text body of the email',
			},
			{
				displayName: 'Date Scheduled',
				name: 'dateScheduled',
				type: 'dateTime',
				default: '',
				description: 'Date and time to send the email',
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
				description: 'Status of the email (only drafts can be modified)',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				description: 'Subject of the email',
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
				resource: ['email'],
				operation: ['find'],
			},
		},
		default: '',
		description: 'Filter emails by lead ID',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['email'],
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
				resource: ['email'],
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
