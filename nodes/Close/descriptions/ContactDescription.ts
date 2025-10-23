import type { INodeProperties } from 'n8n-workflow';

/**
 * Contact Custom Fields UI sections for Create operation
 */
const contactCustomFieldsCreateSections: INodeProperties[] = [
	{
		displayName: 'Custom Fields',
		name: 'contactCustomFields',
		type: 'collection',
		placeholder: 'Add Custom Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		description: 'Add custom field values for this contact',
		options: [
			{
				displayName: 'Text Field',
				name: 'contactCustomTextFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Add text custom fields',
				options: [
					{
						name: 'textFields',
						displayName: 'Text Fields',
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
				displayName: 'Number Field',
				name: 'contactCustomNumberFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Add number custom fields',
				options: [
					{
						name: 'numberFields',
						displayName: 'Number Fields',
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
				displayName: 'Date Field',
				name: 'contactCustomDateFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Add date custom fields',
				options: [
					{
						name: 'dateFields',
						displayName: 'Date Fields',
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
				displayName: 'Choice Field (Single)',
				name: 'contactCustomChoiceSingleFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Add single-choice custom fields',
				options: [
					{
						name: 'choiceSingleFields',
						displayName: 'Single Choice Fields',
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
				displayName: 'Choice Field (Multiple)',
				name: 'contactCustomChoiceMultipleFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Add multiple-choice custom fields',
				options: [
					{
						name: 'choiceMultipleFields',
						displayName: 'Multiple Choice Fields',
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
			{
				displayName: 'User Field (Single)',
				name: 'contactCustomUserSingleFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Add single-user custom fields',
				options: [
					{
						name: 'userSingleFields',
						displayName: 'Single User Fields',
						values: [
							{
								displayName: 'Field Name',
								name: 'fieldId',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getContactSingleUserFields',
								},
								default: '',
								description: 'Select the user field',
							},
							{
								displayName: 'User',
								name: 'fieldValue',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getUsers',
								},
								default: '',
								description: 'Select a user from the list',
							},
						],
					},
				],
			},
			{
				displayName: 'User Field (Multiple)',
				name: 'contactCustomUserMultipleFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Add multiple-user custom fields',
				options: [
					{
						name: 'userMultipleFields',
						displayName: 'Multiple User Fields',
						values: [
							{
								displayName: 'Field Name',
								name: 'fieldId',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getContactMultipleUserFields',
								},
								default: '',
								description: 'Select the user field',
							},
							{
								displayName: 'Users',
								name: 'fieldValues',
								type: 'multiOptions',
								typeOptions: {
									loadOptionsMethod: 'getUsers',
								},
								default: [],
								description: 'Select multiple users from the list',
							},
						],
					},
				],
			},
		],
	},
];

/**
 * Contact Custom Fields UI sections for Update operation
 */
const contactCustomFieldsUpdateSections: INodeProperties[] = contactCustomFieldsCreateSections.map(section => ({
	...section,
	displayOptions: {
		show: {
			resource: ['contact'],
			operation: ['update'],
		},
	},
}));

export const contactOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['contact'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new contact',
				action: 'Create a contact',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a contact',
				action: 'Delete a contact',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a contact',
				action: 'Get a contact',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List contacts',
				action: 'List contacts',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a contact',
				action: 'Update a contact',
			},
		],
		default: 'list',
	},
];

export const contactFields: INodeProperties[] = [
	// CREATE OPERATION FIELDS
	{
		displayName: 'Lead ID',
		name: 'leadId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the lead to create the contact under',
		placeholder: 'lead_xxxxxxxxxxxxxxxx',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Full name of the contact',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Job title of the contact',
			},
			{
				displayName: 'Emails',
				name: 'emails',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Email addresses for the contact',
				options: [
					{
						name: 'emailsValues',
						displayName: 'Email',
						values: [
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{
										name: 'Office',
										value: 'office',
									},
									{
										name: 'Personal',
										value: 'personal',
									},
									{
										name: 'Other',
										value: 'other',
									},
								],
								default: 'office',
								description: 'Type of email',
							},
							{
								displayName: 'Email',
								name: 'email',
								type: 'string',
								default: '',
								description: 'Email address',
								placeholder: 'email@example.com',
							},
						],
					},
				],
			},
			{
				displayName: 'Phones',
				name: 'phones',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Phone numbers for the contact',
				options: [
					{
						name: 'phonesValues',
						displayName: 'Phone',
						values: [
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{
										name: 'Office',
										value: 'office',
									},
									{
										name: 'Mobile',
										value: 'mobile',
									},
									{
										name: 'Home',
										value: 'home',
									},
									{
										name: 'Fax',
										value: 'fax',
									},
									{
										name: 'Other',
										value: 'other',
									},
								],
								default: 'office',
								description: 'Type of phone',
							},
							{
								displayName: 'Phone',
								name: 'phone',
								type: 'string',
								default: '',
								description: 'Phone number',
								placeholder: '+1234567890',
							},
						],
					},
				],
			},
			{
				displayName: 'URLs',
				name: 'urls',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'URLs for the contact',
				options: [
					{
						name: 'urlsValues',
						displayName: 'URL',
						values: [
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{
										name: 'URL',
										value: 'url',
									},
									{
										name: 'Blog',
										value: 'blog',
									},
									{
										name: 'LinkedIn',
										value: 'linkedin',
									},
									{
										name: 'Facebook',
										value: 'facebook',
									},
									{
										name: 'Twitter',
										value: 'twitter',
									},
									{
										name: 'Other',
										value: 'other',
									},
								],
								default: 'url',
								description: 'Type of URL',
							},
							{
								displayName: 'URL',
								name: 'url',
								type: 'string',
								default: '',
								description: 'URL value',
								placeholder: 'https://example.com',
							},
						],
					},
				],
			},
		],
	},

	// DELETE OPERATION FIELDS
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['delete', 'get'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the contact',
		placeholder: 'cont_xxxxxxxxxxxxxxxx',
	},

	// LIST OPERATION FIELDS
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['list'],
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
				resource: ['contact'],
				operation: ['list'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Lead ID',
				name: 'lead_id',
				type: 'string',
				default: '',
				description: 'Filter by lead ID',
				placeholder: 'lead_xxxxxxxxxxxxxxxx',
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				description: 'Search query to filter contacts',
			},
		],
	},

	// UPDATE OPERATION FIELDS
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['update'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the contact to update',
		placeholder: 'cont_xxxxxxxxxxxxxxxx',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Full name of the contact',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Job title of the contact',
			},
			{
				displayName: 'Emails',
				name: 'emails',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Email addresses for the contact',
				options: [
					{
						name: 'emailsValues',
						displayName: 'Email',
						values: [
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{
										name: 'Office',
										value: 'office',
									},
									{
										name: 'Personal',
										value: 'personal',
									},
									{
										name: 'Other',
										value: 'other',
									},
								],
								default: 'office',
								description: 'Type of email',
							},
							{
								displayName: 'Email',
								name: 'email',
								type: 'string',
								default: '',
								description: 'Email address',
								placeholder: 'email@example.com',
							},
						],
					},
				],
			},
			{
				displayName: 'Phones',
				name: 'phones',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Phone numbers for the contact',
				options: [
					{
						name: 'phonesValues',
						displayName: 'Phone',
						values: [
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{
										name: 'Office',
										value: 'office',
									},
									{
										name: 'Mobile',
										value: 'mobile',
									},
									{
										name: 'Home',
										value: 'home',
									},
									{
										name: 'Fax',
										value: 'fax',
									},
									{
										name: 'Other',
										value: 'other',
									},
								],
								default: 'office',
								description: 'Type of phone',
							},
							{
								displayName: 'Phone',
								name: 'phone',
								type: 'string',
								default: '',
								description: 'Phone number',
								placeholder: '+1234567890',
							},
						],
					},
				],
			},
			{
				displayName: 'URLs',
				name: 'urls',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'URLs for the contact',
				options: [
					{
						name: 'urlsValues',
						displayName: 'URL',
						values: [
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{
										name: 'URL',
										value: 'url',
									},
									{
										name: 'Blog',
										value: 'blog',
									},
									{
										name: 'LinkedIn',
										value: 'linkedin',
									},
									{
										name: 'Facebook',
										value: 'facebook',
									},
									{
										name: 'Twitter',
										value: 'twitter',
									},
									{
										name: 'Other',
										value: 'other',
									},
								],
								default: 'url',
								description: 'Type of URL',
							},
							{
								displayName: 'URL',
								name: 'url',
								type: 'string',
								default: '',
								description: 'URL value',
								placeholder: 'https://example.com',
							},
						],
					},
				],
			},
		],
	},

	// Custom Fields for Create
	...contactCustomFieldsCreateSections,

	// Custom Fields for Update
	...contactCustomFieldsUpdateSections,
];
