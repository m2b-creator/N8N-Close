import type { INodeProperties } from 'n8n-workflow';

export const sequenceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['sequence'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new sequence',
				action: 'Create a sequence',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a sequence',
				action: 'Delete a sequence',
			},
			{
				name: 'Find',
				value: 'find',
				description: 'List sequences in the organization',
				action: 'List sequences',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Fetch a single sequence',
				action: 'Get a sequence',
			},
			{
				name: 'Get Subscription',
				value: 'getSubscription',
				description: 'Fetch a single sequence subscription',
				action: 'Get a sequence subscription',
			},
			{
				name: 'List Subscriptions',
				value: 'findSubscriptions',
				description: 'List sequence subscriptions',
				action: 'List sequence subscriptions',
			},
			{
				name: 'Subscribe Contact',
				value: 'subscribe',
				description: 'Subscribe a contact to a sequence',
				action: 'Subscribe a contact to a sequence',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a sequence',
				action: 'Update a sequence',
			},
			{
				name: 'Update Subscription',
				value: 'updateSubscription',
				description: 'Update a sequence subscription (e.g. pause/resume)',
				action: 'Update a sequence subscription',
			},
		],
		default: 'find',
	},
];

export const sequenceFields: INodeProperties[] = [
	// ----- Create / Update Sequence -----
	{
		displayName: 'Sequence ID',
		name: 'sequenceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['sequence'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'The ID of the sequence',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['sequence'],
				operation: ['create'],
			},
		},
		description: 'The name of the sequence',
	},
	{
		displayName: 'Timezone',
		name: 'timezone',
		type: 'string',
		default: 'UTC',
		displayOptions: {
			show: {
				resource: ['sequence'],
				operation: ['create'],
			},
		},
		description: 'IANA timezone for the sequence schedule (e.g. "America/Los_Angeles")',
	},
	{
		displayName: 'Schedule (JSON)',
		name: 'schedule',
		type: 'json',
		default: '{\n  "ranges": [\n    { "weekday": 1, "start": "09:00", "end": "17:00" }\n  ]\n}',
		displayOptions: {
			show: {
				resource: ['sequence'],
				operation: ['create'],
			},
		},
		description: 'Schedule object defining when the sequence may execute (weekday: 1=Mon..7=Sun)',
	},
	{
		displayName: 'Steps (JSON)',
		name: 'steps',
		type: 'json',
		default: '[\n  {\n    "step_type": "email",\n    "delay": 0,\n    "required": true,\n    "email_template_id": "tmpl_xxx",\n    "threading": "old_thread"\n  }\n]',
		displayOptions: {
			show: {
				resource: ['sequence'],
				operation: ['create'],
			},
		},
		description: 'Array of step objects (step_type: "email" or "call", delay in seconds, etc.)',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['sequence'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name for the sequence',
			},
			{
				displayName: 'Schedule (JSON)',
				name: 'schedule',
				type: 'json',
				default: '',
				description: 'New schedule object',
			},
			{
				displayName: 'Steps (JSON)',
				name: 'steps',
				type: 'json',
				default: '',
				description: 'Array of step objects. WARNING: Excluding existing steps will remove them.',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Paused', value: 'paused' },
				],
				default: 'active',
				description: 'New status of the sequence',
			},
		],
	},
	// ----- Find Sequences -----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['sequence'],
				operation: ['find', 'findSubscriptions'],
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
				resource: ['sequence'],
				operation: ['find', 'findSubscriptions'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	// ----- Subscribe Contact -----
	{
		displayName: 'Sequence ID',
		name: 'sequenceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['sequence'],
				operation: ['subscribe'],
			},
		},
		description: 'The ID of the sequence to subscribe the contact to',
	},
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['sequence'],
				operation: ['subscribe'],
			},
		},
		description: 'The ID of the contact being subscribed',
	},
	{
		displayName: 'Contact Email',
		name: 'contactEmail',
		type: 'string',
		placeholder: 'name@example.com',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['sequence'],
				operation: ['subscribe'],
			},
		},
		description: 'Email address of the contact to use for the subscription',
	},
	{
		displayName: 'Sender Account ID',
		name: 'senderAccountId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['sequence'],
				operation: ['subscribe'],
			},
		},
		description: 'Email account ID used as the sender (e.g. emailaccount_xxx)',
	},
	{
		displayName: 'Sender Name',
		name: 'senderName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['sequence'],
				operation: ['subscribe'],
			},
		},
		description: 'Name displayed for the sender',
	},
	{
		displayName: 'Sender Email',
		name: 'senderEmail',
		type: 'string',
		placeholder: 'sender@example.com',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['sequence'],
				operation: ['subscribe'],
			},
		},
		description: 'Email address of the sender',
	},
	{
		displayName: 'Additional Fields',
		name: 'subscribeAdditionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['sequence'],
				operation: ['subscribe'],
			},
		},
		options: [
			{
				displayName: 'Calls Assigned To',
				name: 'callsAssignedTo',
				type: 'string',
				default: '',
				description: 'Comma-separated list of user IDs to whom calls should be assigned',
			},
		],
	},
	// ----- Subscription Get / Update / List -----
	{
		displayName: 'Subscription ID',
		name: 'subscriptionId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['sequence'],
				operation: ['getSubscription', 'updateSubscription'],
			},
		},
		description: 'The ID of the sequence subscription',
	},
	{
		displayName: 'Status',
		name: 'subscriptionStatus',
		type: 'options',
		options: [
			{ name: 'Active', value: 'active' },
			{ name: 'Paused', value: 'paused' },
		],
		default: 'paused',
		displayOptions: {
			show: {
				resource: ['sequence'],
				operation: ['updateSubscription'],
			},
		},
		description: 'New status for the subscription',
	},
	{
		displayName: 'Subscription Filters',
		name: 'subscriptionFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['sequence'],
				operation: ['findSubscriptions'],
			},
		},
		description: 'At least one of sequence ID, contact ID, or lead ID must be provided',
		options: [
			{
				displayName: 'Sequence ID',
				name: 'sequenceId',
				type: 'string',
				default: '',
				description: 'Filter subscriptions by sequence ID',
			},
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				default: '',
				description: 'Filter subscriptions by contact ID',
			},
			{
				displayName: 'Lead ID',
				name: 'leadId',
				type: 'string',
				default: '',
				description: 'Filter subscriptions by lead ID',
			},
		],
	},
];
