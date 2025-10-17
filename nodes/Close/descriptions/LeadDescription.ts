import type { INodeProperties } from 'n8n-workflow';

export const leadOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['lead'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new lead',
				action: 'Create a lead',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a lead',
				action: 'Delete a lead',
			},
			{
				name: 'Find',
				value: 'find',
				description: 'Find leads',
				action: 'Find leads',
			},
			{
				name: 'Merge',
				value: 'merge',
				description: 'Merge two leads',
				action: 'Merge leads',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a lead',
				action: 'Update a lead',
			},
		],
		default: 'find',
	},
];

export const leadFields: INodeProperties[] = [
	// CREATE OPERATION FIELDS
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'The name of the lead (company or organization)',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'The description of the lead',
			},
			{
				displayName: 'Status Name ',
				name: 'statusId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getLeadStatuses',
				},
				default: '',
				description:
					'The status of the lead. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				description: 'The website URL of the lead',
			},
		],
	},
	{
		displayName: 'Contacts',
		name: 'contactsUi',
		placeholder: 'Add Contact',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				name: 'contactsValues',
				displayName: 'Contact',
				values: [
					{
						displayName: 'Contact Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'The name of the contact',
					},
					{
						displayName: 'Contact Office Email',
						name: 'email',
						type: 'string',
						default: '',
						description: 'The office email of the contact',
					},
					{
						displayName: 'Contact Office Phone',
						name: 'phone',
						type: 'string',
						default: '',
						description: 'The office phone number of the contact',
					},
					{
						displayName: 'Contact Mobile Phone',
						name: 'mobilePhone',
						type: 'string',
						default: '',
						description: 'The mobile phone number of the contact',
					},
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						description: 'The job title of the contact',
					},
					{
						displayName: 'Contact Custom Text Fields',
						name: 'contactCustomTextFields',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						description: 'Add custom text fields for this contact',
						options: [
							{
								name: 'textFields',
								displayName: 'Text Field',
								values: [
									{
										displayName: 'Field Name',
										name: 'fieldId',
										type: 'options',
										typeOptions: {
											loadOptionsMethod: 'getContactTextFields',
										},
										default: '',
										description: 'Select the text field',
									},
									{
										displayName: 'Value',
										name: 'fieldValue',
										type: 'string',
										default: '',
										description: 'Enter the text value',
									},
								],
							},
						],
					},
					{
						displayName: 'Contact Custom Number Fields',
						name: 'contactCustomNumberFields',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						description: 'Add custom number fields for this contact',
						options: [
							{
								name: 'numberFields',
								displayName: 'Number Field',
								values: [
									{
										displayName: 'Field Name',
										name: 'fieldId',
										type: 'options',
										typeOptions: {
											loadOptionsMethod: 'getContactNumberFields',
										},
										default: '',
										description: 'Select the number field',
									},
									{
										displayName: 'Value',
										name: 'fieldValue',
										type: 'number',
										default: 0,
										description: 'Enter the numeric value',
									},
								],
							},
						],
					},
					{
						displayName: 'Contact Custom Date Fields',
						name: 'contactCustomDateFields',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						description: 'Add custom date fields for this contact',
						options: [
							{
								name: 'dateFields',
								displayName: 'Date Field',
								values: [
									{
										displayName: 'Field Name',
										name: 'fieldId',
										type: 'options',
										typeOptions: {
											loadOptionsMethod: 'getContactDateFields',
										},
										default: '',
										description: 'Select the date field',
									},
									{
										displayName: 'Value',
										name: 'fieldValue',
										type: 'dateTime',
										default: '',
										description: 'Select the date value',
									},
								],
							},
						],
					},
					{
						displayName: 'Contact Custom Choice Fields (Single)',
						name: 'contactCustomChoiceSingleFields',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						description: 'Add custom single-choice fields for this contact',
						options: [
							{
								name: 'choiceSingleFields',
								displayName: 'Single Choice Field',
								values: [
									{
										displayName: 'Field Name',
										name: 'fieldId',
										type: 'options',
										typeOptions: {
											loadOptionsMethod: 'getContactSingleChoiceFields',
										},
										default: '',
										description: 'Select the choice field',
									},
									{
										displayName: 'Value',
										name: 'fieldValue',
										type: 'options',
										typeOptions: {
											loadOptionsMethod: 'getContactAllChoiceValues',
										},
										default: '',
										description: 'Select a value',
										displayOptions: {
											hide: {
												fieldId: [''],
											},
										},
									},
								],
							},
						],
					},
					{
						displayName: 'Contact Custom Choice Fields (Multiple)',
						name: 'contactCustomChoiceMultipleFields',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						description: 'Add custom multiple-choice fields for this contact',
						options: [
							{
								name: 'choiceMultipleFields',
								displayName: 'Multiple Choice Field',
								values: [
									{
										displayName: 'Field Name',
										name: 'fieldId',
										type: 'options',
										typeOptions: {
											loadOptionsMethod: 'getContactMultipleChoiceFields',
										},
										default: '',
										description: 'Select the choice field',
									},
									{
										displayName: 'Values',
										name: 'fieldValues',
										type: 'multiOptions',
										typeOptions: {
											loadOptionsMethod: 'getContactAllChoiceValues',
										},
										default: [],
										description: 'Select multiple values',
										displayOptions: {
											hide: {
												fieldId: [''],
											},
										},
									},
								],
							},
						],
					},
				],
			},
		],
	},
	{
		displayName: 'Address',
		name: 'addressUi',
		type: 'collection',
		placeholder: 'Add Address Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Address Street',
				name: 'street',
				type: 'string',
				default: '',
				description: 'The street address',
			},
			{
				displayName: 'Address City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'The city',
			},
			{
				displayName: 'Address State',
				name: 'state',
				type: 'string',
				default: '',
				description: 'The state or province',
			},
			{
				displayName: 'Address ZIP Code',
				name: 'zipcode',
				type: 'string',
				default: '',
				description: 'The ZIP or postal code',
			},
			{
				displayName: 'Address Country',
				name: 'country',
				type: 'string',
				default: '',
				description: 'The country',
			},
		],
	},

	// DELETE OPERATION FIELDS
	{
		displayName: 'Lead ID',
		name: 'leadId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['delete'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the lead to delete',
	},

	// MERGE OPERATION FIELDS
	{
		displayName: 'Source Lead ID',
		name: 'sourceLeadId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['merge'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the lead to merge from (this lead will be deleted)',
	},
	{
		displayName: 'Destination Lead ID',
		name: 'destinationLeadId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['merge'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the lead to merge into (this lead will remain)',
	},

	// FIND OPERATION FIELDS
	{
		displayName: 'Lead ID',
		name: 'leadId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['find'],
			},
		},
		default: '',
		required: false,
		description: 'The ID of the lead to retrieve information for. If provided, will search for this specific lead.',
	},
	{
		displayName: 'Company Name',
		name: 'companyName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['find'],
			},
		},
		default: '',
		description: 'Search for leads by company name',
	},
	{
		displayName: 'Company URL',
		name: 'companyUrl',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['find'],
			},
		},
		default: '',
		description: 'Search for leads by company website URL',
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['find'],
			},
		},
		default: '',
		description: 'Search for leads by contact email address',
	},
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['find'],
			},
		},
		default: '',
		description: 'Search for leads by contact phone number',
	},
	{
		displayName: 'Status Name ',
		name: 'statusId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getLeadStatuses',
		},
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['find'],
			},
		},
		default: '',
		description:
			'Filter leads by status. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['lead'],
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
				resource: ['lead'],
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
	// UPDATE OPERATION FIELDS
	{
		displayName: 'Lead ID',
		name: 'leadId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['update'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the lead to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'The name of the lead',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'The description of the lead',
			},
			{
				displayName: 'Status Name ',
				name: 'statusId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getLeadStatuses',
				},
				default: '',
				description:
					'The status of the lead. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				description: 'The website URL of the lead',
			},
		],
	},
];
