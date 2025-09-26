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
	{
		displayName: 'Custom Fields',
		name: 'customFields',
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
		description: 'Add custom field values with dynamic field selection',
		options: [
			{
				name: 'customFieldsValues',
				displayName: 'Custom Field',
				values: [
					{
						displayName: 'Field Type',
						name: 'fieldType',
						type: 'options',
						options: [
							{ name: 'Choice (Single)', value: 'choice_single' },
							{ name: 'Choice (Multiple)', value: 'choice_multiple' },
							{ name: 'Text', value: 'text' },
							{ name: 'Number', value: 'number' },
							{ name: 'Date', value: 'date' },
							{ name: 'DateTime', value: 'datetime' },
							{ name: 'User (Single)', value: 'user_single' },
							{ name: 'User (Multiple)', value: 'user_multiple' },
							{ name: 'Contact (Single)', value: 'contact_single' },
							{ name: 'Contact (Multiple)', value: 'contact_multiple' },
						],
						default: '',
						description: 'Select the type of custom field',
					},
					{
						displayName: 'Field',
						name: 'fieldId',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getFieldsByType',
							loadOptionsDependsOn: ['fieldType'],
						},
						default: '',
						description: 'Select the custom field',
						displayOptions: {
							show: {
								fieldType: [
									'choice_single',
									'choice_multiple',
									'contact_single',
									'contact_multiple',
								],
							},
						},
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
							show: {
								fieldType: ['choice_single'],
							},
							hide: {
								fieldId: [''],
							},
						},
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
							show: {
								fieldType: ['choice_multiple'],
							},
							hide: {
								fieldId: [''],
							},
						},
					},
					{
						displayName: 'Value',
						name: 'fieldValue',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getUsers',
						},
						default: '',
						description: 'Select a user from the list',
						displayOptions: {
							show: {
								fieldType: ['user_single'],
							},
						},
					},
					{
						displayName: 'Values',
						name: 'fieldValues',
						type: 'multiOptions',
						typeOptions: {
							loadOptionsMethod: 'getUsers',
						},
						default: [],
						description: 'Select multiple users from the list',
						displayOptions: {
							show: {
								fieldType: ['user_multiple'],
							},
						},
					},
					{
						displayName: 'Value',
						name: 'fieldValue',
						type: 'string',
						default: '',
						description: 'Enter the text value',
						displayOptions: {
							show: {
								fieldType: ['text'],
							},
						},
					},
					{
						displayName: 'Value',
						name: 'fieldValue',
						type: 'number',
						default: 0,
						description: 'Enter the numeric value',
						displayOptions: {
							show: {
								fieldType: ['number'],
							},
						},
					},
					{
						displayName: 'Value',
						name: 'fieldValue',
						type: 'dateTime',
						default: '',
						description: 'Select the date value',
						displayOptions: {
							show: {
								fieldType: ['date', 'datetime'],
							},
						},
					},
					{
						displayName: 'Value',
						name: 'fieldValue',
						type: 'string',
						default: '',
						description: 'Enter the contact ID',
						placeholder: 'contact_xxxxxxxxxxxxxxxx',
						displayOptions: {
							show: {
								fieldType: ['contact_single'],
							},
						},
					},
					{
						displayName: 'Values',
						name: 'fieldValues',
						type: 'string',
						default: '',
						description: 'Enter contact IDs separated by commas',
						placeholder: 'contact_xxx..., contact_yyy...',
						displayOptions: {
							show: {
								fieldType: ['contact_multiple'],
							},
						},
					},
				],
			},
		],
	},
];;

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
	 * Get fields filtered by the selected field type
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
	 * Get choices/options for a specific field (handles both choices and user fields)
	 */
	async getFieldChoices(context: any): Promise<INodePropertyOptions[]> {
		const fieldId = context.getCurrentNodeParameter('fieldId') as string;
		const fieldType = context.getCurrentNodeParameter('fieldType') as string;
		
		if (!fieldId || !fieldType) {
			return [];
		}

		const fields = await this.getCachedCustomFields(context);
		const field = fields.find(f => f.id === fieldId);
		
		if (!field) {
			return [];
		}

		// Handle choice fields
		if (fieldType.startsWith('choice_') && field.type === 'choices') {
			if (!field.choices || !Array.isArray(field.choices)) {
				return [];
			}
			return field.choices.map(choice => ({
				name: choice,
				value: choice,
			}));
		}

		// Handle user fields
		if (fieldType.startsWith('user_') && field.type === 'user') {
			return await this.getCachedUsers(context);
		}

		return [];
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

	// Handle the new dynamic custom fields structure
	const customFields = customFieldsData.customFields;
	if (!customFields || !customFields.customFieldsValues) {
		return payload;
	}

	const customFieldValues = customFields.customFieldsValues;
	if (!Array.isArray(customFieldValues)) {
		return payload;
	}

	for (const fieldData of customFieldValues) {
		const { fieldType, fieldId, fieldValue, fieldValues } = fieldData;
		
		if (!fieldId || !fieldType) {
			continue;
		}

		const field = fields.find(f => f.id === fieldId);
		if (!field) {
			continue;
		}

		let value: any;

		// Determine the value based on field type
		switch (fieldType) {
			case 'choice_single':
			case 'text':
			case 'date':
			case 'datetime':
			case 'user_single':
			case 'contact_single':
				value = fieldValue;
				break;
				
			case 'number':
				value = Number(fieldValue);
				if (isNaN(value)) {
					throw new Error(`Custom field "${field.name}" validation error: Number field value must be a valid number`);
				}
				break;
				
			case 'choice_multiple':
			case 'user_multiple':
				value = fieldValues;
				break;
				
			case 'contact_multiple':
				// Handle comma-separated string to array conversion
				if (typeof fieldValues === 'string') {
					value = fieldValues.split(',').map(id => id.trim()).filter(id => id);
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

	return payload;
}