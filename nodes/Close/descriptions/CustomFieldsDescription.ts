import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

import { closeApiRequest } from '../GenericFunctions';

/**
 * Cache for storing custom field definitions with workspace isolation
 * Structure: Map<workspaceId, { timestamp: number, fields: CustomField[] }>
 */
const customFieldsCache = new Map<string, { timestamp: number; fields: any[] }>();

/**
 * Cache for storing user lists with workspace isolation
 * Structure: Map<workspaceId, { timestamp: number, users: INodePropertyOptions[] }>
 */
const usersCache = new Map<string, { timestamp: number; users: INodePropertyOptions[] }>();

/**
 * Cache TTL in milliseconds (10 minutes for fields, 15 minutes for users)
 */
const FIELD_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const USER_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Custom field interface based on Close CRM API response
 */
interface CustomField {
	id: string;
	name: string;
	type: 'choices' | 'text' | 'number' | 'date' | 'datetime' | 'user' | 'contact';
	accepts_multiple_values: boolean;
	choices?: string[];
}

/**
 * Get workspace ID for cache isolation
 */
function getWorkspaceId(context: any): string {
	// Use credentials hash or organization ID for workspace isolation
	// Fallback to 'default' if no specific identifier available
	const credentials = context.getCredentials?.('closeApi');
	return credentials?.apiKey ? Buffer.from(credentials.apiKey).toString('base64').substring(0, 16) : 'default';
}

/**
 * Check if cache is still valid
 */
function isCacheValid(timestamp: number, ttl: number): boolean {
	return Date.now() - timestamp < ttl;
}

/**
 * Custom Fields UI sections for Create operation
 */
export const customFieldsCreateSections: INodeProperties[] = [
	// Choice Fields Section (Single)
	{
		displayName: 'Single Choice Fields',
		name: 'singleChoiceFields',
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
		description: 'Dropdown fields that accept a single selection',
		options: [
			{
				name: 'singleChoiceFieldsValues',
				displayName: 'Single Choice Field',
				values: [
					{
						displayName: 'Field Name',
						name: 'fieldId',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getSingleChoiceFields',
						},
						default: '',
						description: 'Select a single-choice dropdown field',
					},
					{
						displayName: 'Field Value',
						name: 'fieldValue',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getFieldChoices',
							loadOptionsDependsOn: ['fieldId'],
						},
						default: '',
						description: 'Select a value from the dropdown options',
					},
				],
			},
		],
	},
	// Choice Fields Section (Multiple)
	{
		displayName: 'Multiple Choice Fields',
		name: 'multipleChoiceFields',
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
		description: 'Dropdown fields that accept multiple selections',
		options: [
			{
				name: 'multipleChoiceFieldsValues',
				displayName: 'Multiple Choice Field',
				values: [
					{
						displayName: 'Field Name',
						name: 'fieldId',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getMultipleChoiceFields',
						},
						default: '',
						description: 'Select a multiple-choice dropdown field',
					},
					{
						displayName: 'Field Values',
						name: 'fieldValues',
						type: 'multiOptions',
						typeOptions: {
							loadOptionsMethod: 'getFieldChoices',
							loadOptionsDependsOn: ['fieldId'],
						},
						default: [],
						description: 'Select multiple values from the dropdown options',
					},
				],
			},
		],
	},
	// Text Fields Section
	{
		displayName: 'Text Fields',
		name: 'textFields',
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
		description: 'Text input fields',
		options: [
			{
				name: 'textFieldsValues',
				displayName: 'Text Field',
				values: [
					{
						displayName: 'Field Name',
						name: 'fieldId',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getTextFields',
						},
						default: '',
						description: 'Select a text field',
					},
					{
						displayName: 'Field Value',
						name: 'fieldValue',
						type: 'string',
						default: '',
						description: 'Enter the text value',
					},
				],
			},
		],
	},
	// Number Fields Section
	{
		displayName: 'Number Fields',
		name: 'numberFields',
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
		description: 'Numeric input fields',
		options: [
			{
				name: 'numberFieldsValues',
				displayName: 'Number Field',
				values: [
					{
						displayName: 'Field Name',
						name: 'fieldId',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getNumberFields',
						},
						default: '',
						description: 'Select a number field',
					},
					{
						displayName: 'Field Value',
						name: 'fieldValue',
						type: 'number',
						default: 0,
						description: 'Enter the numeric value',
					},
				],
			},
		],
	},
	// Date Fields Section
	{
		displayName: 'Date Fields',
		name: 'dateFields',
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
		description: 'Date input fields',
		options: [
			{
				name: 'dateFieldsValues',
				displayName: 'Date Field',
				values: [
					{
						displayName: 'Field Name',
						name: 'fieldId',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getDateFields',
						},
						default: '',
						description: 'Select a date field',
					},
					{
						displayName: 'Field Value',
						name: 'fieldValue',
						type: 'dateTime',
						default: '',
						description: 'Select the date value',
					},
				],
			},
		],
	},
	// DateTime Fields Section
	{
		displayName: 'DateTime Fields',
		name: 'datetimeFields',
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
		description: 'Date and time input fields',
		options: [
			{
				name: 'datetimeFieldsValues',
				displayName: 'DateTime Field',
				values: [
					{
						displayName: 'Field Name',
						name: 'fieldId',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getDateTimeFields',
						},
						default: '',
						description: 'Select a datetime field',
					},
					{
						displayName: 'Field Value',
						name: 'fieldValue',
						type: 'dateTime',
						default: '',
						description: 'Select the date and time value',
					},
				],
			},
		],
	},
	// User Fields Section (Single)
	{
		displayName: 'Single User Fields',
		name: 'singleUserFields',
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
		description: 'User selection fields (single user)',
		options: [
			{
				name: 'singleUserFieldsValues',
				displayName: 'Single User Field',
				values: [
					{
						displayName: 'Field Name',
						name: 'fieldId',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getSingleUserFields',
						},
						default: '',
						description: 'Select a single user field',
					},
					{
						displayName: 'Field Value',
						name: 'fieldValue',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getCachedUsers',
						},
						default: '',
						description: 'Select a user',
					},
				],
			},
		],
	},
	// User Fields Section (Multiple)
	{
		displayName: 'Multiple User Fields',
		name: 'multipleUserFields',
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
		description: 'User selection fields (multiple users)',
		options: [
			{
				name: 'multipleUserFieldsValues',
				displayName: 'Multiple User Field',
				values: [
					{
						displayName: 'Field Name',
						name: 'fieldId',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getMultipleUserFields',
						},
						default: '',
						description: 'Select a multiple user field',
					},
					{
						displayName: 'Field Values',
						name: 'fieldValues',
						type: 'multiOptions',
						typeOptions: {
							loadOptionsMethod: 'getCachedUsers',
						},
						default: [],
						description: 'Select multiple users',
					},
				],
			},
		],
	},
	// Contact Fields Section (Single)
	{
		displayName: 'Single Contact Fields',
		name: 'singleContactFields',
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
		description: 'Contact selection fields (single contact)',
		options: [
			{
				name: 'singleContactFieldsValues',
				displayName: 'Single Contact Field',
				values: [
					{
						displayName: 'Field Name',
						name: 'fieldId',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getSingleContactFields',
						},
						default: '',
						description: 'Select a single contact field',
					},
					{
						displayName: 'Field Value',
						name: 'fieldValue',
						type: 'string',
						default: '',
						description: 'Enter the contact ID',
						placeholder: 'contact_xxxxxxxxxxxxxxxx',
					},
				],
			},
		],
	},
	// Contact Fields Section (Multiple)
	{
		displayName: 'Multiple Contact Fields',
		name: 'multipleContactFields',
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
		description: 'Contact selection fields (multiple contacts)',
		options: [
			{
				name: 'multipleContactFieldsValues',
				displayName: 'Multiple Contact Field',
				values: [
					{
						displayName: 'Field Name',
						name: 'fieldId',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getMultipleContactFields',
						},
						default: '',
						description: 'Select a multiple contact field',
					},
					{
						displayName: 'Field Values',
						name: 'fieldValues',
						type: 'string',
						default: '',
						description: 'Enter contact IDs separated by commas',
						placeholder: 'contact_xxx..., contact_yyy...',
					},
				],
			},
		],
	},
];

/**
 * Custom Fields UI sections for Update operation (same structure as create)
 */
export const customFieldsUpdateSections: INodeProperties[] = customFieldsCreateSections.map(section => ({
	...section,
	displayOptions: {
		show: {
			resource: ['lead'],
			operation: ['update'],
		},
	},
}));

/**
 * Load options methods for the new custom fields implementation
 */
export const customFieldsLoadMethods = {
	/**
	 * Get cached custom fields with workspace isolation
	 */
	async getCachedCustomFields(context: any): Promise<CustomField[]> {
		const workspaceId = getWorkspaceId(context);
		const cached = customFieldsCache.get(workspaceId);

		if (cached && isCacheValid(cached.timestamp, FIELD_CACHE_TTL)) {
			return cached.fields;
		}

		try {
			// Use the existing Close API request function for consistency
			const fields = await closeApiRequest.call(context, 'GET', '/custom_field/lead/');
			const fieldsData = fields.data || fields;

			if (!Array.isArray(fieldsData)) {
				console.error('Unexpected custom fields response format:', fieldsData);
				return [];
			}

			// Cache the results
			customFieldsCache.set(workspaceId, {
				timestamp: Date.now(),
				fields: fieldsData,
			});

			return fieldsData;
		} catch (error) {
			console.error('Error fetching custom fields:', error);
			return [];
		}
	},

	/**
	 * Get cached users with workspace isolation
	 */
	async getCachedUsers(context: any): Promise<INodePropertyOptions[]> {
		const workspaceId = getWorkspaceId(context);
		const cached = usersCache.get(workspaceId);

		if (cached && isCacheValid(cached.timestamp, USER_CACHE_TTL)) {
			return cached.users;
		}

		try {
			// Use the existing Close API request function for consistency
			const users = await closeApiRequest.call(context, 'GET', '/user/');
			const usersData = users.data || [];

			const userOptions: INodePropertyOptions[] = usersData.map((user: any) => ({
				name: `${user.first_name} ${user.last_name} (${user.email})`,
				value: user.id,
			}));

			// Cache the results
			usersCache.set(workspaceId, {
				timestamp: Date.now(),
				users: userOptions,
			});

			return userOptions;
		} catch (error) {
			console.error('Error fetching users:', error);
			return [];
		}
	},

	/**
	 * Filter fields by type and cardinality
	 */
	filterFieldsByType(fields: CustomField[], type: string, multiple?: boolean): INodePropertyOptions[] {
		return fields
			.filter(field => {
				if (field.type !== type) return false;
				if (multiple !== undefined && field.accepts_multiple_values !== multiple) return false;
				return true;
			})
			.map(field => ({
				name: `${field.name} (${field.accepts_multiple_values ? 'Multiple' : 'Single'})`,
				value: field.id,
			}));
	},

	/**
	 * Get choices for a specific field
	 */
	getChoicesForField(fields: CustomField[], fieldId: string): INodePropertyOptions[] {
		const field = fields.find(f => f.id === fieldId);
		if (!field || field.type !== 'choices' || !field.choices) {
			return [];
		}
		return field.choices.map(choice => ({
			name: choice,
			value: choice,
		}));
	},
};

/**
 * Validation functions for custom field values
 */
export const customFieldValidators = {
	/**
	 * Validate text field value
	 */
	validateText(value: any): string | null {
		if (typeof value !== 'string') {
			return 'Text field value must be a string';
		}
		if (value.length > 1000) {
			return 'Text field value cannot exceed 1000 characters';
		}
		return null;
	},

	/**
	 * Validate number field value
	 */
	validateNumber(value: any): string | null {
		const num = Number(value);
		if (isNaN(num)) {
			return 'Number field value must be a valid number';
		}
		return null;
	},

	/**
	 * Validate date field value
	 */
	validateDate(value: any): string | null {
		if (typeof value !== 'string') {
			return 'Date field value must be a string in ISO format';
		}
		const date = new Date(value);
		if (isNaN(date.getTime())) {
			return 'Date field value must be a valid date';
		}
		return null;
	},

	/**
	 * Validate choice field value
	 */
	validateChoice(value: any, field: CustomField): string | null {
		if (!field.choices) {
			return 'Field has no available choices';
		}

		if (field.accepts_multiple_values) {
			if (!Array.isArray(value)) {
				return 'Multiple choice field value must be an array';
			}
			for (const v of value) {
				if (!field.choices.includes(v)) {
					return `Invalid choice: ${v}`;
				}
			}
		} else {
			if (!field.choices.includes(value)) {
				return `Invalid choice: ${value}`;
			}
		}
		return null;
	},

	/**
	 * Validate user field value
	 */
	validateUser(value: any, field: CustomField): string | null {
		if (field.accepts_multiple_values) {
			if (!Array.isArray(value)) {
				return 'Multiple user field value must be an array';
			}
			for (const v of value) {
				if (typeof v !== 'string' || !v.startsWith('user_')) {
					return `Invalid user ID format: ${v}`;
				}
			}
		} else {
			if (typeof value !== 'string' || !value.startsWith('user_')) {
				return `Invalid user ID format: ${value}`;
			}
		}
		return null;
	},

	/**
	 * Validate contact field value
	 */
	validateContact(value: any, field: CustomField): string | null {
		if (field.accepts_multiple_values) {
			if (!Array.isArray(value)) {
				return 'Multiple contact field value must be an array';
			}
			for (const v of value) {
				if (typeof v !== 'string' || !v.startsWith('contact_')) {
					return `Invalid contact ID format: ${v}`;
				}
			}
		} else {
			if (typeof value !== 'string' || !value.startsWith('contact_')) {
				return `Invalid contact ID format: ${value}`;
			}
		}
		return null;
	},
};

/**
 * Utility function to construct custom field payload
 */
export function constructCustomFieldsPayload(customFieldsData: any, fields: CustomField[]): Record<string, any> {
	const payload: Record<string, any> = {};

	// Process each field type section
	const sections = [
		'singleChoiceFields',
		'multipleChoiceFields',
		'textFields',
		'numberFields',
		'dateFields',
		'datetimeFields',
		'singleUserFields',
		'multipleUserFields',
		'singleContactFields',
		'multipleContactFields',
	];

	for (const section of sections) {
		const sectionData = customFieldsData[section];
		if (!sectionData) continue;

		const valuesKey = `${section}Values`;
		const values = sectionData[valuesKey];
		if (!Array.isArray(values)) continue;

		for (const fieldData of values) {
			const fieldId = fieldData.fieldId;
			if (!fieldId) continue;

			const field = fields.find(f => f.id === fieldId);
			if (!field) continue;

			let value = fieldData.fieldValue || fieldData.fieldValues;

			// Handle multiple contact fields special case (comma-separated string to array)
			if (section === 'multipleContactFields' && typeof value === 'string') {
				value = value.split(',').map(id => id.trim()).filter(id => id);
			}

			// Validate the value
			let validationError: string | null = null;

			switch (field.type) {
				case 'text':
					validationError = customFieldValidators.validateText(value);
					break;
				case 'number':
					validationError = customFieldValidators.validateNumber(value);
					break;
				case 'date':
				case 'datetime':
					validationError = customFieldValidators.validateDate(value);
					break;
				case 'choices':
					validationError = customFieldValidators.validateChoice(value, field);
					break;
				case 'user':
					validationError = customFieldValidators.validateUser(value, field);
					break;
				case 'contact':
					validationError = customFieldValidators.validateContact(value, field);
					break;
			}

			if (validationError) {
				throw new Error(`Custom field "${field.name}" validation error: ${validationError}`);
			}

			// Add to payload with proper key format
			payload[`custom.${fieldId}`] = value;
		}
	}

	return payload;
}