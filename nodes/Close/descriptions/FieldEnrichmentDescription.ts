import type { INodeProperties } from 'n8n-workflow';

export const fieldEnrichmentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['fieldEnrichment'],
			},
		},
		options: [
			{
				name: 'Enrich Field',
				value: 'enrich',
				description: 'Use AI to populate a custom field on a lead or contact',
				action: 'Enrich a field',
			},
		],
		default: 'enrich',
	},
];

export const fieldEnrichmentFields: INodeProperties[] = [
	{
		displayName: 'Organization ID',
		name: 'organizationId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['fieldEnrichment'],
				operation: ['enrich'],
			},
		},
		description: 'The ID of the organization that owns the target object',
	},
	{
		displayName: 'Object Type',
		name: 'objectType',
		type: 'options',
		options: [
			{ name: 'Lead', value: 'lead' },
			{ name: 'Contact', value: 'contact' },
		],
		default: 'lead',
		required: true,
		displayOptions: {
			show: {
				resource: ['fieldEnrichment'],
				operation: ['enrich'],
			},
		},
		description: 'Type of object to enrich',
	},
	{
		displayName: 'Object ID',
		name: 'objectId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['fieldEnrichment'],
				operation: ['enrich'],
			},
		},
		description: 'The ID of the lead or contact to enrich',
	},
	{
		displayName: 'Field ID',
		name: 'fieldId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['fieldEnrichment'],
				operation: ['enrich'],
			},
		},
		description: 'The ID of the custom field to enrich',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['fieldEnrichment'],
				operation: ['enrich'],
			},
		},
		options: [
			{
				displayName: 'Set New Value',
				name: 'setNewValue',
				type: 'boolean',
				default: true,
				description: 'Whether to update the field with the enriched value',
			},
			{
				displayName: 'Overwrite Existing Value',
				name: 'overwriteExistingValue',
				type: 'boolean',
				default: false,
				description: 'Whether to overwrite the existing field value if one is set',
			},
		],
	},
];
