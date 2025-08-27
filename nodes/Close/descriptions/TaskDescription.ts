import type { INodeProperties } from 'n8n-workflow';

export const taskOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['task'],
			},
		},
		options: [
			{
				name: 'Bulk Update',
				value: 'bulkUpdate',
				description: 'Bulk-update multiple tasks',
				action: 'Bulk update tasks',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a task',
				action: 'Create a task',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a task',
				action: 'Delete a task',
			},
			{
				name: 'Find',
				value: 'find',
				description: 'Find tasks',
				action: 'Find tasks',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Fetch a single task',
				action: 'Get a task',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a task',
				action: 'Update a task',
			},
		],
		default: 'create',
	},
];

export const taskFields: INodeProperties[] = [
	// Fields for Create operation (keeping original structure)
	{
		displayName: 'Lead ID',
		name: 'leadId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the lead to create the task for',
	},
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'The text content of the task',
	},
	{
		displayName: 'Date',
		name: 'date',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'The date when the task should be actionable',
	},
	{
		displayName: 'Assigned To',
		name: 'assignedTo',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The user ID to assign the task to',
	},
	// Fields for Delete operation
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['delete'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the task to delete',
	},
	// Fields for Get operation
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['get'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the task to fetch',
	},
	// Fields for Update operation
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['update'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the task to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Assigned To',
				name: 'assignedTo',
				type: 'string',
				default: '',
				description: 'User ID to assign the task to',
			},
			{
				displayName: 'Date',
				name: 'date',
				type: 'dateTime',
				default: '',
				description: 'Date/time when the task is actionable',
			},
			{
				displayName: 'Is Complete',
				name: 'isComplete',
				type: 'boolean',
				default: false,
				description: 'Whether the task is complete',
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'The task description/text (only for lead type tasks)',
			},
		],
	},
	// Fields for Find operation
	{
		displayName: 'Task Type',
		name: 'taskType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['find'],
			},
		},
		options: [
			{
				name: 'All Types',
				value: 'all',
				description: 'Show all task types',
			},
			{
				name: 'Answered Detached Call',
				value: 'answered_detached_call',
				description: 'Calls from unassociated numbers',
			},
			{
				name: 'Email Follow-up',
				value: 'email_followup',
				description: 'Follow-up reminders for sent emails',
			},
			{
				name: 'Incoming Email',
				value: 'incoming_email',
				description: 'Incoming email tasks',
			},
			{
				name: 'Incoming SMS',
				value: 'incoming_sms',
				description: 'Incoming SMS tasks',
			},
			{
				name: 'Lead',
				value: 'lead',
				description: 'Lead-related tasks (default)',
			},
			{
				name: 'Missed Call',
				value: 'missed_call',
				description: 'Missed call tasks',
			},
			{
				name: 'Opportunity Due',
				value: 'opportunity_due',
				description: 'Opportunities scheduled to close',
			},
			{
				name: 'Voicemail',
				value: 'voicemail',
				description: 'Voicemail tasks',
			},
		],
		default: 'lead',
		description: 'Filter tasks by type',
	},
	{
		displayName: 'Lead ID',
		name: 'leadId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['find'],
			},
		},
		default: '',
		description: 'Filter tasks by lead ID',
	},
	{
		displayName: 'View',
		name: 'view',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['find'],
			},
		},
		options: [
			{
				name: 'All',
				value: '',
				description: 'Show all tasks (no view filter)',
			},
			{
				name: 'Archive',
				value: 'archive',
				description: 'Show complete tasks only',
			},
			{
				name: 'Future',
				value: 'future',
				description: 'Show incomplete tasks starting from tomorrow',
			},
			{
				name: 'Inbox',
				value: 'inbox',
				description: 'Show incomplete tasks up to end of today',
			},
		],
		default: '',
		description: 'Convenient task view filter',
	},
	{
		displayName: 'Additional Filters',
		name: 'additionalFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['find'],
			},
		},
		options: [
			{
				displayName: 'Assigned To',
				name: 'assignedTo',
				type: 'string',
				default: '',
				description: 'Filter tasks by assigned user ID',
			},
			{
				displayName: 'Date After',
				name: 'dateGt',
				type: 'dateTime',
				default: '',
				description: 'Filter tasks with date after this value',
			},
			{
				displayName: 'Date After or Equal',
				name: 'dateGte',
				type: 'dateTime',
				default: '',
				description: 'Filter tasks with date after or equal to this value',
			},
			{
				displayName: 'Date Before',
				name: 'dateLt',
				type: 'dateTime',
				default: '',
				description: 'Filter tasks with date before this value',
			},
			{
				displayName: 'Date Before or Equal',
				name: 'dateLte',
				type: 'dateTime',
				default: '',
				description: 'Filter tasks with date before or equal to this value',
			},
			{
				displayName: 'Date Created After',
				name: 'dateCreatedGt',
				type: 'dateTime',
				default: '',
				description: 'Filter tasks created after this date',
			},
			{
				displayName: 'Date Created After or Equal',
				name: 'dateCreatedGte',
				type: 'dateTime',
				default: '',
				description: 'Filter tasks created after or equal to this date',
			},
			{
				displayName: 'Date Created Before',
				name: 'dateCreatedLt',
				type: 'dateTime',
				default: '',
				description: 'Filter tasks created before this date',
			},
			{
				displayName: 'Date Created Before or Equal',
				name: 'dateCreatedLte',
				type: 'dateTime',
				default: '',
				description: 'Filter tasks created before or equal to this date',
			},
			{
				displayName: 'Is Complete',
				name: 'isComplete',
				type: 'boolean',
				default: false,
				description: 'Filter by completion status',
			},
			{
				displayName: 'Order By',
				name: 'orderBy',
				type: 'options',
				options: [
					{
						name: 'Date (Ascending)',
						value: 'date',
					},
					{
						name: 'Date (Descending)',
						value: '-date',
					},
					{
						name: 'Date Created (Ascending)',
						value: 'date_created',
					},
					{
						name: 'Date Created (Descending)',
						value: '-date_created',
					},
				],
				default: 'date',
				description: 'Order tasks by date or creation date',
			},
			{
				displayName: 'Task IDs',
				name: 'taskIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of task IDs to filter',
			},
		],
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['task'],
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
				resource: ['task'],
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
	// Fields for Bulk Update operation
	{
		displayName: 'Filter Tasks',
		name: 'bulkFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['bulkUpdate'],
			},
		},
		options: [
			{
				displayName: 'Task IDs',
				name: 'taskIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of task IDs to update',
			},
			{
				displayName: 'Task Type',
				name: 'taskType',
				type: 'string',
				default: '',
				description: 'Filter by task type',
			},
			{
				displayName: 'Lead ID',
				name: 'leadId',
				type: 'string',
				default: '',
				description: 'Filter by lead ID',
			},
			{
				displayName: 'Is Complete',
				name: 'isComplete',
				type: 'boolean',
				default: false,
				description: 'Filter by completion status',
			},
			{
				displayName: 'Assigned To',
				name: 'assignedTo',
				type: 'string',
				default: '',
				description: 'Filter by assigned user ID',
			},
		],
	},
	{
		displayName: 'Update Data',
		name: 'bulkUpdateData',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['bulkUpdate'],
			},
		},
		options: [
			{
				displayName: 'Assigned To',
				name: 'assignedTo',
				type: 'string',
				default: '',
				description: 'User ID to assign the tasks to',
			},
			{
				displayName: 'Date',
				name: 'date',
				type: 'dateTime',
				default: '',
				description: 'New date/time for the tasks',
			},
			{
				displayName: 'Is Complete',
				name: 'isComplete',
				type: 'boolean',
				default: false,
				description: 'New completion status for the tasks',
			},
		],
	},
];
