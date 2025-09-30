import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

import { closeApiRequest, closeApiRequestAllItems } from '../GenericFunctions';

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
 * Normalize various possible Close API responses into an array of CustomField items
 * Supports shapes like: { data: [...] }, [ { data: [...], has_more: false } ], or an array of fields
 */
function normalizeCustomFieldsResponse(raw: any): CustomField[] {
	if (!raw) return [];

	// If already an array of fields
	if (Array.isArray(raw)) {
		if (raw.length === 0) return [];
		// Some wrappers return an array of objects with a .data array inside
		if (raw[0] && Array.isArray((raw[0] as any).data)) {
			return (raw as any[]).flatMap((entry: any) => Array.isArray(entry.data) ? entry.data : []);
		}
		// Assume it's already the list of fields
		return raw as CustomField[];
	}

	// Object with data property
	if ((raw as any).data && Array.isArray((raw as any).data)) {
		return (raw as any).data as CustomField[];
	}

	// Single field object fallback
	if ((raw as any).id && (raw as any).type) {
		return [raw as CustomField];
	}

	return [];
}

/**
 * Custom Fields UI sections for Create operation
 */
export const customFieldsCreateSections: INodeProperties[] = [
	{
		displayName: 'Custom Fields',
		name: 'customFields',
		type: 'collection',
		placeholder: 'Add Custom Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['create'],
			},
		},
		description: 'Add custom field values',
		options: [
			{
				displayName: 'Text Field',
				name: 'textField',
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
									loadOptionsMethod: 'getTextFields',
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
				name: 'numberField',
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
									loadOptionsMethod: 'getNumberFields',
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
				name: 'dateField',
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
									loadOptionsMethod: 'getDateFields',
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
				name: 'choiceSingleField',
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
									loadOptionsMethod: 'getSingleChoiceFields',
								},
								default: '',
								description: 'Select the choice field',
							},
							{
								displayName: 'Value',
								name: 'fieldValue',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getFieldChoices',
									loadOptionsDependsOn: ['fieldId'],
								},
								default: '',
								description: 'Select a value from the available options',
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
				name: 'choiceMultipleField',
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
									loadOptionsMethod: 'getMultipleChoiceFields',
								},
								default: '',
								description: 'Select the choice field',
							},
							{
								displayName: 'Values',
								name: 'fieldValues',
								type: 'multiOptions',
								typeOptions: {
									loadOptionsMethod: 'getFieldChoices',
									loadOptionsDependsOn: ['fieldId'],
								},
								default: [],
								description: 'Select multiple values from the available options',
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
				name: 'userSingleField',
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
									loadOptionsMethod: 'getSingleUserFields',
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
				name: 'userMultipleField',
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
									loadOptionsMethod: 'getMultipleUserFields',
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
			{
				displayName: 'Contact Field (Single)',
				name: 'contactSingleField',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Add single-contact custom fields',
				options: [
					{
						name: 'contactSingleFields',
						displayName: 'Single Contact Fields',
						values: [
							{
								displayName: 'Field Name',
								name: 'fieldId',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getSingleContactFields',
								},
								default: '',
								description: 'Select the contact field',
							},
							{
								displayName: 'Contact ID',
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
			{
				displayName: 'Contact Field (Multiple)',
				name: 'contactMultipleField',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Add multiple-contact custom fields',
				options: [
					{
						name: 'contactMultipleFields',
						displayName: 'Multiple Contact Fields',
						values: [
							{
								displayName: 'Field Name',
								name: 'fieldId',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getMultipleContactFields',
								},
								default: '',
								description: 'Select the contact field',
							},
							{
								displayName: 'Contact IDs',
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
			// Prefer the all-items helper to flatten pagination and match JSON shapes
			let fieldsData: CustomField[] = [];
			try {
				fieldsData = await (closeApiRequestAllItems as any).call(context, 'data', 'GET', '/custom_field/lead/');
			} catch {
				// Fallback to single request and normalization
				const raw = await (closeApiRequest as any).call(context, 'GET', '/custom_field/lead/');
				fieldsData = normalizeCustomFieldsResponse(raw);
			}

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
			const users = await (closeApiRequest as any).call(context, 'GET', '/user/');
			const usersData = (users && Array.isArray(users.data)) ? users.data : normalizeCustomFieldsResponse(users);

			const userOptions: INodePropertyOptions[] = (usersData as any[]).map((user: any) => ({
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
	 * Get text fields
	 */
	async getTextFields(context: any): Promise<INodePropertyOptions[]> {
		const fields = await this.getCachedCustomFields(context);
		return fields
			.filter(field => field.type === 'text')
			.map(field => ({
				name: field.name,
				value: field.id,
			}));
	},

	/**
	 * Get number fields
	 */
	async getNumberFields(context: any): Promise<INodePropertyOptions[]> {
		const fields = await this.getCachedCustomFields(context);
		return fields
			.filter(field => field.type === 'number')
			.map(field => ({
				name: field.name,
				value: field.id,
			}));
	},

	/**
	 * Get date fields (includes both date and datetime)
	 */
	async getDateFields(context: any): Promise<INodePropertyOptions[]> {
		const fields = await this.getCachedCustomFields(context);
		return fields
			.filter(field => field.type === 'date' || field.type === 'datetime')
			.map(field => ({
				name: field.name,
				value: field.id,
			}));
	},

	/**
	 * Get single choice fields
	 */
	async getChoiceSingleFields(context: any): Promise<INodePropertyOptions[]> {
		const fields = await this.getCachedCustomFields(context);
		return fields
			.filter(field => field.type === 'choices' && !field.accepts_multiple_values)
			.map(field => ({
				name: field.name,
				value: field.id,
			}));
	},

	/**
	 * Get multiple choice fields
	 */
	async getChoiceMultipleFields(context: any): Promise<INodePropertyOptions[]> {
		const fields = await this.getCachedCustomFields(context);
		return fields
			.filter(field => field.type === 'choices' && field.accepts_multiple_values)
			.map(field => ({
				name: field.name,
				value: field.id,
			}));
	},

	/**
	 * Get single user fields
	 */
	async getUserSingleFields(context: any): Promise<INodePropertyOptions[]> {
		const fields = await this.getCachedCustomFields(context);
		return fields
			.filter(field => field.type === 'user' && !field.accepts_multiple_values)
			.map(field => ({
				name: field.name,
				value: field.id,
			}));
	},

	/**
	 * Get multiple user fields
	 */
	async getUserMultipleFields(context: any): Promise<INodePropertyOptions[]> {
		const fields = await this.getCachedCustomFields(context);
		return fields
			.filter(field => field.type === 'user' && field.accepts_multiple_values)
			.map(field => ({
				name: field.name,
				value: field.id,
			}));
	},

	/**
	 * Get single contact fields
	 */
	async getContactSingleFields(context: any): Promise<INodePropertyOptions[]> {
		const fields = await this.getCachedCustomFields(context);
		return fields
			.filter(field => field.type === 'contact' && !field.accepts_multiple_values)
			.map(field => ({
				name: field.name,
				value: field.id,
			}));
	},

	/**
	 * Get multiple contact fields
	 */
	async getContactMultipleFields(context: any): Promise<INodePropertyOptions[]> {
		const fields = await this.getCachedCustomFields(context);
		return fields
			.filter(field => field.type === 'contact' && field.accepts_multiple_values)
			.map(field => ({
				name: field.name,
				value: field.id,
			}));
	},

	/**
	 * Get choices/options for a specific field (handles choice fields)
	 */
	async getFieldChoices(context: any): Promise<INodePropertyOptions[]> {
		const fieldId = context.getCurrentNodeParameter('fieldId') as string;
		
		if (!fieldId) {
			return [];
		}

		const fields = await this.getCachedCustomFields(context);
		const field = fields.find(f => f.id === fieldId);
		
		if (!field) {
			return [];
		}

		// Handle choice fields
		if (field.type === 'choices') {
			if (!field.choices || !Array.isArray(field.choices)) {
				return [];
			}
			return field.choices.map(choice => ({
				name: choice,
				value: choice,
			}));
		}

		return [];
	},

	/**
	 * Get fields filtered by the selected field type (legacy method)
	 */
	async getFieldsByType(context: any): Promise<INodePropertyOptions[]> {
		const fieldType = context.getCurrentNodeParameter('fieldType') as string;
		if (!fieldType) {
			return [];
		}

		const fields = await this.getCachedCustomFields(context);

		// Map field types to API types and cardinality
		const typeMapping: Record<string, { type: string; multiple?: boolean }> = {
			choice_single: { type: 'choices', multiple: false },
			choice_multiple: { type: 'choices', multiple: true },
			text: { type: 'text' },
			number: { type: 'number' },
			date: { type: 'date' },
			datetime: { type: 'datetime' },
			user_single: { type: 'user', multiple: false },
			user_multiple: { type: 'user', multiple: true },
			contact_single: { type: 'contact', multiple: false },
			contact_multiple: { type: 'contact', multiple: true },
		};

		const config = typeMapping[fieldType];
		if (!config) {
			return [];
		}

		return fields
			.filter(field => {
				if (field.type !== config.type) return false;
				if (config.multiple !== undefined && field.accepts_multiple_values !== config.multiple) return false;
				return true;
			})
			.map(field => ({
				name: field.name,
				value: field.id,
			}));
	},

	/**
	 * Filter fields by type and cardinality (legacy method)
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
	 * Get choices for a specific field (legacy method)
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

	/**
	 * Expose users as loadOptions method for UI dropdowns
	 */
	async getUsers(context: any): Promise<INodePropertyOptions[]> {
		return this.getCachedUsers(context);
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
		const values = field.accepts_multiple_values ? (Array.isArray(value) ? value : [value]) : [value];
		for (const v of values) {
			const s = String(v);
			if (s.indexOf('user_') !== 0) {
				return `Invalid user ID format: ${v}`;
			}
		}
		return null;
	},

	/**
	 * Validate contact field value
	 */
	validateContact(value: any, field: CustomField): string | null {
		const values = field.accepts_multiple_values ? (Array.isArray(value) ? value : [value]) : [value];
		for (const v of values) {
			const s = String(v);
			if (s.indexOf('contact_') !== 0) {
				return `Invalid contact ID format: ${v}`;
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

	// Handle the new collection-based custom fields structure
	const customFields = customFieldsData.customFields;
	if (!customFields) {
		return payload;
	}

	// Helper function to process field values
	const processFields = (fieldsArray: any[], fieldType: string) => {
		if (!Array.isArray(fieldsArray)) return;

		for (const fieldData of fieldsArray) {
			const { fieldId, fieldValue, fieldValues } = fieldData;
			
			if (!fieldId) {
				continue;
			}

			const field = fields.find(f => f.id === fieldId);
			if (!field) {
				continue;
			}

			let value: any;

			// Determine the value based on field type
			switch (fieldType) {
				case 'text':
				case 'date':
				case 'choiceSingle':
				case 'userSingle':
				case 'contactSingle':
					value = fieldValue;
					break;
					
				case 'number':
					value = Number(fieldValue);
					if (isNaN(value)) {
						throw new Error(`Custom field "${field.name}" validation error: Number field value must be a valid number`);
					}
					break;
					
				case 'choiceMultiple':
				case 'userMultiple':
					value = fieldValues;
					break;
					
				case 'contactMultiple':
					// Handle comma-separated string to array conversion
					if (typeof fieldValues === 'string') {
						value = String(fieldValues).split(',').map(id => id.trim()).filter(id => id);
					} else if (Array.isArray(fieldValues)) {
						value = fieldValues;
					} else {
						value = [];
					}
					break;
					
				default:
					continue;
			}

			// Skip if value is empty
			if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
				continue;
			}

			// Validate the value based on field type
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
	};

	// Process each field type collection
	if (customFields.textField?.textFields) {
		processFields(customFields.textField.textFields, 'text');
	}

	if (customFields.numberField?.numberFields) {
		processFields(customFields.numberField.numberFields, 'number');
	}

	if (customFields.dateField?.dateFields) {
		processFields(customFields.dateField.dateFields, 'date');
	}

	if (customFields.choiceSingleField?.choiceSingleFields) {
		processFields(customFields.choiceSingleField.choiceSingleFields, 'choiceSingle');
	}

	if (customFields.choiceMultipleField?.choiceMultipleFields) {
		processFields(customFields.choiceMultipleField.choiceMultipleFields, 'choiceMultiple');
	}

	if (customFields.userSingleField?.userSingleFields) {
		processFields(customFields.userSingleField.userSingleFields, 'userSingle');
	}

	if (customFields.userMultipleField?.userMultipleFields) {
		processFields(customFields.userMultipleField.userMultipleFields, 'userMultiple');
	}

	if (customFields.contactSingleField?.contactSingleFields) {
		processFields(customFields.contactSingleField.contactSingleFields, 'contactSingle');
	}

	if (customFields.contactMultipleField?.contactMultipleFields) {
		processFields(customFields.contactMultipleField.contactMultipleFields, 'contactMultiple');
	}

	return payload;
}