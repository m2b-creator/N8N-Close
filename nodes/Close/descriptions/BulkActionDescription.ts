import type { INodeProperties } from 'n8n-workflow';

export const bulkActionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['bulkAction'],
			},
		},
		options: [
			{
				name: 'Send Bulk Email',
				value: 'createEmail',
				description: 'Initiate a new bulk email',
				action: 'Send a bulk email',
			},
			{
				name: 'List Bulk Emails',
				value: 'listEmail',
				description: 'List previously initiated bulk emails',
				action: 'List bulk emails',
			},
			{
				name: 'Get Bulk Email',
				value: 'getEmail',
				description: 'Fetch a single bulk email action',
				action: 'Get a bulk email',
			},
			{
				name: 'Bulk Edit',
				value: 'createEdit',
				description: 'Initiate a new bulk edit action',
				action: 'Bulk edit leads',
			},
			{
				name: 'List Bulk Edits',
				value: 'listEdit',
				description: 'List previously initiated bulk edits',
				action: 'List bulk edits',
			},
			{
				name: 'Get Bulk Edit',
				value: 'getEdit',
				description: 'Fetch a single bulk edit action',
				action: 'Get a bulk edit',
			},
			{
				name: 'Bulk Delete',
				value: 'createDelete',
				description: 'Initiate a new bulk delete action',
				action: 'Bulk delete leads',
			},
			{
				name: 'List Bulk Deletes',
				value: 'listDelete',
				description: 'List previously initiated bulk deletes',
				action: 'List bulk deletes',
			},
			{
				name: 'Get Bulk Delete',
				value: 'getDelete',
				description: 'Fetch a single bulk delete action',
				action: 'Get a bulk delete',
			},
			{
				name: 'Bulk Sequence Subscription',
				value: 'createSequenceSubscription',
				description: 'Initiate a new bulk sequence subscription action',
				action: 'Run a bulk sequence subscription',
			},
			{
				name: 'List Bulk Sequence Subscriptions',
				value: 'listSequenceSubscription',
				description: 'List bulk sequence subscription actions',
				action: 'List bulk sequence subscriptions',
			},
			{
				name: 'Get Bulk Sequence Subscription',
				value: 'getSequenceSubscription',
				description: 'Fetch a single bulk sequence subscription action',
				action: 'Get a bulk sequence subscription',
			},
		],
		default: 'createEmail',
	},
];

const sQueryField: INodeProperties = {
	displayName: 'Search Query (s_query JSON)',
	name: 'sQuery',
	type: 'json',
	default: '{}',
	description:
		'Advanced filtering query object identifying the leads/contacts to act on. See Close Advanced Filtering docs.',
};

const commonBulkOptions: INodeProperties = {
	displayName: 'Additional Fields',
	name: 'additionalFields',
	type: 'collection',
	placeholder: 'Add Field',
	default: {},
	options: [
		{
			displayName: 'Send Done Email',
			name: 'sendDoneEmail',
			type: 'boolean',
			default: true,
			description: 'Whether to receive a notification email once the bulk action is finished',
		},
		{
			displayName: 'Results Limit',
			name: 'resultsLimit',
			type: 'number',
			typeOptions: { minValue: 1 },
			default: 0,
			description: 'Max number of records to process. Leave 0 to disable.',
		},
		{
			displayName: 'Sort (JSON)',
			name: 'sort',
			type: 'json',
			default: '',
			description: 'Optional array of sort specifications',
		},
	],
};

export const bulkActionFields: INodeProperties[] = [
	// ----- Get operations: shared ID field -----
	{
		displayName: 'Bulk Action ID',
		name: 'bulkActionId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['getEmail', 'getEdit', 'getDelete', 'getSequenceSubscription'],
			},
		},
		description: 'The ID of the bulk action to fetch',
	},
	// ----- List operations: pagination -----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['listEmail', 'listEdit', 'listDelete', 'listSequenceSubscription'],
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
				resource: ['bulkAction'],
				operation: ['listEmail', 'listEdit', 'listDelete', 'listSequenceSubscription'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},

	// ===== Bulk Email =====
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createEmail'],
			},
		},
		description: 'ID of the email template to send',
	},
	{
		displayName: 'Email Account ID',
		name: 'emailAccountId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createEmail'],
			},
		},
		description: 'ID of the email account used to send the emails',
	},
	{
		displayName: 'Contact Preference',
		name: 'contactPreference',
		type: 'options',
		options: [
			{ name: 'Lead (Primary Contact Email)', value: 'lead' },
			{ name: 'Contact (First Email Per Contact)', value: 'contact' },
		],
		default: 'lead',
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createEmail'],
			},
		},
		description: 'Whether to use the primary contact email per lead, or the first email per contact',
	},
	{
		...sQueryField,
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createEmail'],
			},
		},
	},
	{
		...commonBulkOptions,
		name: 'emailAdditionalFields',
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createEmail'],
			},
		},
		options: [
			...((commonBulkOptions.options as INodeProperties[]) ?? []),
			{
				displayName: 'Sender',
				name: 'sender',
				type: 'string',
				default: '',
				description: 'Sender email address override',
			},
		],
	},

	// ===== Bulk Edit =====
	{
		displayName: 'Edit Type',
		name: 'editType',
		type: 'options',
		options: [
			{ name: 'Set Lead Status', value: 'set_lead_status' },
			{ name: 'Set Custom Field', value: 'set_custom_field' },
			{ name: 'Clear Custom Field', value: 'clear_custom_field' },
		],
		default: 'set_lead_status',
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createEdit'],
			},
		},
		description: 'The kind of edit to perform on each matching record',
	},
	{
		displayName: 'Lead Status',
		name: 'leadStatusId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getLeadStatuses',
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createEdit'],
				editType: ['set_lead_status'],
			},
		},
		description: 'Lead status to assign. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
	},
	{
		displayName: 'Custom Field ID',
		name: 'customFieldId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createEdit'],
				editType: ['set_custom_field', 'clear_custom_field'],
			},
		},
		description: 'ID of the custom field to update',
	},
	{
		displayName: 'Custom Field Value',
		name: 'customFieldValue',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createEdit'],
				editType: ['set_custom_field'],
			},
		},
		description: 'New value for the custom field. For multi-value fields supply a JSON array.',
	},
	{
		displayName: 'Custom Field Operation',
		name: 'customFieldOperation',
		type: 'options',
		options: [
			{ name: 'Replace', value: 'replace' },
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' },
		],
		default: 'replace',
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createEdit'],
				editType: ['set_custom_field'],
			},
		},
		description: 'Operation for multi-value custom fields',
	},
	{
		...sQueryField,
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createEdit'],
			},
		},
	},
	{
		...commonBulkOptions,
		name: 'editAdditionalFields',
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createEdit'],
			},
		},
	},

	// ===== Bulk Delete =====
	{
		...sQueryField,
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createDelete'],
			},
		},
	},
	{
		...commonBulkOptions,
		name: 'deleteAdditionalFields',
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createDelete'],
			},
		},
	},

	// ===== Bulk Sequence Subscription =====
	{
		displayName: 'Action Type',
		name: 'sequenceActionType',
		type: 'options',
		options: [
			{ name: 'Subscribe', value: 'subscribe' },
			{ name: 'Pause', value: 'pause' },
			{ name: 'Resume', value: 'resume' },
			{ name: 'Resume Finished', value: 'resume_finished' },
		],
		default: 'subscribe',
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createSequenceSubscription'],
			},
		},
		description: 'The bulk subscription action to perform',
	},
	{
		displayName: 'Sequence ID',
		name: 'sequenceId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createSequenceSubscription'],
				sequenceActionType: ['subscribe'],
			},
		},
		description: 'Required for "subscribe": the sequence to enroll matched contacts in',
	},
	{
		displayName: 'Sender Account ID',
		name: 'senderAccountId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createSequenceSubscription'],
				sequenceActionType: ['subscribe'],
			},
		},
		description: 'Required for "subscribe": email account ID used to send the sequence',
	},
	{
		displayName: 'Sender Name',
		name: 'senderName',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createSequenceSubscription'],
				sequenceActionType: ['subscribe'],
			},
		},
		description: 'Required for "subscribe": display name of the sender',
	},
	{
		displayName: 'Sender Email',
		name: 'senderEmail',
		type: 'string',
		placeholder: 'sender@example.com',
		default: '',
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createSequenceSubscription'],
				sequenceActionType: ['subscribe'],
			},
		},
		description: 'Required for "subscribe": email address of the sender',
	},
	{
		displayName: 'Contact Preference',
		name: 'contactPreference',
		type: 'options',
		options: [
			{ name: 'Lead (Primary Contact Email)', value: 'lead' },
			{ name: 'Contact (First Email Per Contact)', value: 'contact' },
		],
		default: 'lead',
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createSequenceSubscription'],
				sequenceActionType: ['subscribe'],
			},
		},
		description: 'Whether to use the primary lead email or per-contact emails',
	},
	{
		...sQueryField,
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createSequenceSubscription'],
			},
		},
	},
	{
		...commonBulkOptions,
		name: 'sequenceSubscriptionAdditionalFields',
		displayOptions: {
			show: {
				resource: ['bulkAction'],
				operation: ['createSequenceSubscription'],
			},
		},
	},
];
