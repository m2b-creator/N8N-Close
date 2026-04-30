import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Close } from '../Close.node';

// Mock the GenericFunctions module
jest.mock('../GenericFunctions', () => ({
	closeApiRequest: jest.fn(),
	closeApiRequestAllItems: jest.fn(),
	convertPlainTextToHTML: jest.fn((text: string) => `<body><p>${text}</p></body>`),
}));

import { closeApiRequest, closeApiRequestAllItems } from '../GenericFunctions';

describe('Close', () => {
	let close: Close;
	let mockExecuteFunctions: jest.Mocked<IExecuteFunctions>;

	beforeEach(() => {
		close = new Close();

		// Mock IExecuteFunctions
		mockExecuteFunctions = {
			getInputData: jest.fn(),
			getNodeParameter: jest.fn(),
			helpers: {
				constructExecutionMetaData: jest.fn().mockImplementation((data: any) => [data]),
				returnJsonArray: jest
					.fn()
					.mockImplementation((data: any) => (Array.isArray(data) ? data : [data])),
			},
			continueOnFail: jest.fn(),
			getNode: jest.fn(),
		} as any;

		// Reset mocks
		jest.clearAllMocks();
	});

	describe('Node Description', () => {
		it('should be defined', () => {
			expect(close).toBeDefined();
		});

		it('should have the correct display name', () => {
			expect(close.description.displayName).toBe('Close CRM');
		});

		it('should have the correct name', () => {
			expect(close.description.name).toBe('close');
		});

		it('should have credentials', () => {
			expect(close.description.credentials).toHaveLength(1);
			expect(close.description.credentials![0].name).toBe('closeApi');
		});

		it('should have load options methods', () => {
			expect(close.methods?.loadOptions).toBeDefined();
			expect(close.methods?.loadOptions?.getLeadStatuses).toBeDefined();
			expect(close.methods?.loadOptions?.getOpportunityStatuses).toBeDefined();
			expect(close.methods?.loadOptions?.getFieldsByType).toBeDefined();
			expect(close.methods?.loadOptions?.getFieldChoices).toBeDefined();
			expect(close.methods?.loadOptions?.getCachedUsers).toBeDefined();
			expect(close.methods?.loadOptions?.getSmartViews).toBeDefined();
		});

		it('should have resource options', () => {
			const resourceProperty = close.description.properties.find(
				(prop) => prop.name === 'resource',
			);
			expect(resourceProperty).toBeDefined();
			expect(resourceProperty?.type).toBe('options');
			expect(resourceProperty?.options).toHaveLength(16);
			const resourceValues = resourceProperty?.options?.map((op: any) => op.value);
			expect(resourceValues).toEqual(
				expect.arrayContaining([
					'sequence',
					'bulkAction',
					'export',
					'fieldEnrichment',
				]),
			);
		});

		it('should have all lead operations', () => {
			const operationProperty = close.description.properties.find(
				(prop) =>
					prop.name === 'operation' && prop.displayOptions?.show?.resource?.includes('lead'),
			);
			expect(operationProperty).toBeDefined();
			expect(operationProperty?.options).toHaveLength(5);

			const operationValues = operationProperty?.options?.map((op: any) => op.value);
			expect(operationValues).toContain('create');
			expect(operationValues).toContain('delete');
			expect(operationValues).toContain('find');
			expect(operationValues).toContain('merge');
			expect(operationValues).toContain('update');
		});

		it('should have all lead status operations', () => {
			const operationProperty = close.description.properties.find(
				(prop) =>
					prop.name === 'operation' && prop.displayOptions?.show?.resource?.includes('leadStatus'),
			);
			expect(operationProperty).toBeDefined();
			expect(operationProperty?.options).toHaveLength(4);

			const operationValues = operationProperty?.options?.map((op: any) => op.value);
			expect(operationValues).toContain('create');
			expect(operationValues).toContain('delete');
			expect(operationValues).toContain('list');
			expect(operationValues).toContain('update');
		});

		it('should have all opportunity operations', () => {
			const operationProperty = close.description.properties.find(
				(prop) =>
					prop.name === 'operation' && prop.displayOptions?.show?.resource?.includes('opportunity'),
			);
			expect(operationProperty).toBeDefined();
			expect(operationProperty?.options).toHaveLength(4);

			const operationValues = operationProperty?.options?.map((op: any) => op.value);
			expect(operationValues).toContain('create');
			expect(operationValues).toContain('delete');
			expect(operationValues).toContain('find');
			expect(operationValues).toContain('update');
		});

		it('should have all call operations', () => {
			const operationProperty = close.description.properties.find(
				(prop) =>
					prop.name === 'operation' && prop.displayOptions?.show?.resource?.includes('call'),
			);
			expect(operationProperty).toBeDefined();
			expect(operationProperty?.options).toHaveLength(5);

			const operationValues = operationProperty?.options?.map((op: any) => op.value);
			expect(operationValues).toContain('create');
			expect(operationValues).toContain('delete');
			expect(operationValues).toContain('find');
			expect(operationValues).toContain('get');
			expect(operationValues).toContain('update');
		});

		it('should have all contact operations', () => {
			const operationProperty = close.description.properties.find(
				(prop) =>
					prop.name === 'operation' && prop.displayOptions?.show?.resource?.includes('contact'),
			);
			expect(operationProperty).toBeDefined();
			expect(operationProperty?.options).toHaveLength(5);

			const operationValues = operationProperty?.options?.map((op: any) => op.value);
			expect(operationValues).toContain('create');
			expect(operationValues).toContain('delete');
			expect(operationValues).toContain('get');
			expect(operationValues).toContain('list');
			expect(operationValues).toContain('update');
		});

		it('should have all email operations', () => {
			const operationProperty = close.description.properties.find(
				(prop) =>
					prop.name === 'operation' && prop.displayOptions?.show?.resource?.includes('email'),
			);
			expect(operationProperty).toBeDefined();
			expect(operationProperty?.options).toHaveLength(5);

			const operationValues = operationProperty?.options?.map((op: any) => op.value);
			expect(operationValues).toContain('create');
			expect(operationValues).toContain('delete');
			expect(operationValues).toContain('find');
			expect(operationValues).toContain('get');
			expect(operationValues).toContain('update');
		});

		it('should have all meeting operations', () => {
			const operationProperty = close.description.properties.find(
				(prop) =>
					prop.name === 'operation' && prop.displayOptions?.show?.resource?.includes('meeting'),
			);
			expect(operationProperty).toBeDefined();
			expect(operationProperty?.options).toHaveLength(4);

			const operationValues = operationProperty?.options?.map((op: any) => op.value);
			expect(operationValues).toContain('delete');
			expect(operationValues).toContain('find');
			expect(operationValues).toContain('get');
			expect(operationValues).toContain('update');
		});

		it('should have all note operations', () => {
			const operationProperty = close.description.properties.find(
				(prop) =>
					prop.name === 'operation' && prop.displayOptions?.show?.resource?.includes('note'),
			);
			expect(operationProperty).toBeDefined();
			expect(operationProperty?.options).toHaveLength(5);

			const operationValues = operationProperty?.options?.map((op: any) => op.value);
			expect(operationValues).toContain('create');
			expect(operationValues).toContain('delete');
			expect(operationValues).toContain('find');
			expect(operationValues).toContain('get');
			expect(operationValues).toContain('update');
		});

		it('should have all sms operations', () => {
			const operationProperty = close.description.properties.find(
				(prop) => prop.name === 'operation' && prop.displayOptions?.show?.resource?.includes('sms'),
			);
			expect(operationProperty).toBeDefined();
			expect(operationProperty?.options).toHaveLength(5);

			const operationValues = operationProperty?.options?.map((op: any) => op.value);
			expect(operationValues).toContain('create');
			expect(operationValues).toContain('delete');
			expect(operationValues).toContain('find');
			expect(operationValues).toContain('get');
			expect(operationValues).toContain('update');
		});

		it('should have all opportunity status operations', () => {
			const operationProperty = close.description.properties.find(
				(prop) =>
					prop.name === 'operation' &&
					prop.displayOptions?.show?.resource?.includes('opportunityStatus'),
			);
			expect(operationProperty).toBeDefined();
			expect(operationProperty?.options).toHaveLength(4);

			const operationValues = operationProperty?.options?.map((op: any) => op.value);
			expect(operationValues).toContain('create');
			expect(operationValues).toContain('delete');
			expect(operationValues).toContain('list');
			expect(operationValues).toContain('update');
		});

		it('should have all task operations', () => {
			const operationProperty = close.description.properties.find(
				(prop) =>
					prop.name === 'operation' && prop.displayOptions?.show?.resource?.includes('task'),
			);
			expect(operationProperty).toBeDefined();
			expect(operationProperty?.options).toHaveLength(6);

			const operationValues = operationProperty?.options?.map((op: any) => op.value);
			expect(operationValues).toContain('bulkUpdate');
			expect(operationValues).toContain('create');
			expect(operationValues).toContain('delete');
			expect(operationValues).toContain('find');
			expect(operationValues).toContain('get');
			expect(operationValues).toContain('update');
		});
	});

	describe('Lead Operations', () => {
		beforeEach(() => {
			mockExecuteFunctions.getInputData.mockReturnValue([{ json: {} }]);
		});

		describe('Create Lead', () => {
			it('should create a lead with minimum required fields', async () => {
				const mockResponse = {
					id: 'lead_abc123',
					name: 'Test Company',
					status_id: 'stat_default',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('lead') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('Test Company') // name
					.mockReturnValueOnce({}) // additionalFields
					.mockReturnValueOnce({}) // contactsUi
					.mockReturnValueOnce({}) // addressUi
					.mockReturnValueOnce({}); // customFieldsUi

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				const result = await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/lead/', {
					name: 'Test Company',
				});
				expect(result[0]).toHaveLength(1);
			});

			it('should create a lead with additional fields', async () => {
				const mockResponse = {
					id: 'lead_abc123',
					name: 'Test Company',
					description: 'Test Description',
					status_id: 'stat_qualified',
					url: 'https://test.com',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('lead') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('Test Company') // name
					.mockReturnValueOnce({
						description: 'Test Description',
						statusId: 'stat_qualified',
						url: 'https://test.com',
					}) // additionalFields
					.mockReturnValueOnce({}) // contactsUi
					.mockReturnValueOnce({}) // addressUi
					.mockReturnValueOnce({}); // customFieldsUi

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/lead/', {
					name: 'Test Company',
					description: 'Test Description',
					status_id: 'stat_qualified',
					url: 'https://test.com',
				});
			});

			it('should create a lead with contacts', async () => {
				const mockResponse = {
					id: 'lead_abc123',
					name: 'Test Company',
					contacts: [{ name: 'John Doe', emails: [{ email: 'john@test.com' }] }],
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('lead') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('Test Company') // name
					.mockReturnValueOnce({}) // additionalFields
					.mockReturnValueOnce({
						contactsValues: [
							{
								name: 'John Doe',
								email: 'john@test.com',
								phone: '+1234567890',
								title: 'CEO',
							},
						],
					}) // contactsUi
					.mockReturnValueOnce({}) // addressUi
					.mockReturnValueOnce({}); // customFieldsUi

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/lead/', {
					name: 'Test Company',
					contacts: [
						{
							name: 'John Doe',
							emails: [{ type: 'office', email: 'john@test.com' }],
							phones: [{ type: 'office', phone: '+1234567890' }],
							title: 'CEO',
						},
					],
				});
			});

			it('should omit null contact fields when creating a lead', async () => {
				const mockResponse = {
					id: 'lead_abc123',
					name: 'Test Company',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('lead') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('Test Company') // name
					.mockReturnValueOnce({}) // additionalFields
					.mockReturnValueOnce({
						contactsValues: [
							{
								name: 'Jane Doe',
								email: null,
								phone: null,
								mobilePhone: null,
								title: 'CTO',
							},
						],
					}) // contactsUi
					.mockReturnValueOnce({}) // addressUi
					.mockReturnValueOnce({}); // customFieldsUi

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/lead/', {
					name: 'Test Company',
					contacts: [
						{
							name: 'Jane Doe',
							title: 'CTO',
						},
					],
				});
			});

			it('should create a lead with custom fields', async () => {
				const mockResponse = {
					id: 'lead_abc123',
					name: 'Test Company',
					'custom.cf_abc123': 'Custom Value',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('lead') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('Test Company') // name
					.mockReturnValueOnce({}) // additionalFields
					.mockReturnValueOnce({}) // contactsUi
					.mockReturnValueOnce({}) // addressUi
					.mockReturnValueOnce({
						customFieldsValues: [
							{
								fieldId: 'cf_abc123|text',
								fieldValue: 'Custom Value',
							},
						],
					}); // customFieldsUi

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/lead/', {
					name: 'Test Company',
					'custom.cf_abc123': 'Custom Value',
				});
			});

			it('should throw error when name is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('lead') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce(''); // name (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Lead name is required for create operation',
				);
			});
		});

		describe('Delete Lead', () => {
			it('should delete a lead successfully', async () => {
				const mockResponse = {};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('lead') // resource
					.mockReturnValueOnce('delete') // operation
					.mockReturnValueOnce('lead_abc123'); // leadId

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('DELETE', '/lead/lead_abc123/');
			});

			it('should throw error when lead ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('lead') // resource
					.mockReturnValueOnce('delete') // operation
					.mockReturnValueOnce(''); // leadId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Lead ID is required for delete operation',
				);
			});
		});

		describe('Merge Leads', () => {
			it('should merge two leads successfully', async () => {
				const mockResponse = {
					id: 'lead_destination',
					name: 'Merged Company',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('lead') // resource
					.mockReturnValueOnce('merge') // operation
					.mockReturnValueOnce('lead_source123') // sourceLeadId
					.mockReturnValueOnce('lead_dest456'); // destinationLeadId

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/lead/merge/', {
					source: 'lead_source123',
					destination: 'lead_dest456',
				});
			});

			it('should throw error when source lead ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('lead') // resource
					.mockReturnValueOnce('merge') // operation
					.mockReturnValueOnce(''); // sourceLeadId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Source Lead ID is required for merge operation',
				);
			});

			it('should throw error when destination lead ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('lead') // resource
					.mockReturnValueOnce('merge') // operation
					.mockReturnValueOnce('lead_source123') // sourceLeadId
					.mockReturnValueOnce(''); // destinationLeadId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Destination Lead ID is required for merge operation',
				);
			});
		});

		describe('Find Lead', () => {
			it('should find a specific lead by ID', async () => {
				const mockResponse = { id: 'lead_123', name: 'Company 1' };

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('lead') // resource
					.mockReturnValueOnce('find') // operation
					.mockReturnValueOnce('lead_123'); // leadId

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('GET', '/lead/lead_123/');
			});

			it('should return all leads when no filters are provided', async () => {
				const mockResponse = {
					data: [
						{
							id: 'lead_abc123',
							name: 'Test Company 1',
							status_id: 'stat_abc123'
						},
						{
							id: 'lead_def456',
							name: 'Test Company 2',
							status_id: 'stat_def456'
						}
					]
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('lead') // resource
					.mockReturnValueOnce('find') // operation
					.mockReturnValueOnce('') // leadId (empty)
					.mockReturnValueOnce('') // companyName (empty)
					.mockReturnValueOnce('') // companyUrl (empty)
					.mockReturnValueOnce('') // email (empty)
					.mockReturnValueOnce('') // phone (empty)
					.mockReturnValueOnce('') // statusId (empty)
					.mockReturnValueOnce(false) // returnAll
					.mockReturnValueOnce(50); // limit

				(closeApiRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('GET', '/lead/', {}, { _limit: 50 });
			});

			it('should use advanced filtering API when company name is provided', async () => {
				const mockResponse = {
					data: [
						{
							id: 'lead_abc123',
							name: 'Test Company',
							display_name: 'Test Company',
							status_id: 'stat_abc123'
						}
					]
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('lead') // resource
					.mockReturnValueOnce('find') // operation
					.mockReturnValueOnce('') // leadId (empty)
					.mockReturnValueOnce('Test Company') // companyName
					.mockReturnValueOnce('') // companyUrl (empty)
					.mockReturnValueOnce('') // email (empty)
					.mockReturnValueOnce('') // phone (empty)
					.mockReturnValueOnce('') // statusId (empty)
					.mockReturnValueOnce(false) // returnAll
					.mockReturnValueOnce(50); // limit

				(closeApiRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/data/search/', {
					query: {
						type: 'and',
						queries: [
							{
								type: 'object_type',
								object_type: 'lead'
							},
							{
								type: 'field_condition',
								field: {
									type: 'regular_field',
									object_type: 'lead',
									field_name: 'display_name'
								},
								condition: {
									type: 'text',
									mode: 'full_words',
									value: 'Test Company'
								}
							}
						]
					},
					_fields: {
						lead: ['id', 'display_name', 'name', 'description', 'url', 'status_id', 'status_label',
							   'contacts', 'addresses', 'created_by', 'date_created', 'date_updated',
							   'organization_id', 'tasks', 'opportunities']
					},
					results_limit: 50
				});
			});
		});

		describe('Update Lead', () => {
			it('should update a lead with basic fields', async () => {
				const mockResponse = {
					id: 'lead_abc123',
					name: 'Updated Company',
					description: 'Updated Description',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('lead') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce('lead_abc123') // leadId
					.mockReturnValueOnce({
						name: 'Updated Company',
						description: 'Updated Description',
					}) // updateFields
					.mockReturnValueOnce({}) // contactsUi
					.mockReturnValueOnce({}) // addressUi
					.mockReturnValueOnce({}) // customFieldsUi
					.mockReturnValueOnce({}); // customFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('PUT', '/lead/lead_abc123/', {
					name: 'Updated Company',
					description: 'Updated Description',
				});
			});

			it('should throw error when lead ID is missing for update', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('lead') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce(''); // leadId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Lead ID is required for update operation',
				);
			});
		});
	});

	describe('Lead Status Operations', () => {
		beforeEach(() => {
			mockExecuteFunctions.getInputData.mockReturnValue([{ json: {} }]);
		});

		describe('List Lead Statuses', () => {
			it('should list all lead statuses', async () => {
				const mockResponse = {
					data: [
						{ id: 'stat_1', label: 'New Lead', type: 'active' },
						{ id: 'stat_2', label: 'Qualified', type: 'active' },
						{ id: 'stat_3', label: 'Won', type: 'won' },
						{ id: 'stat_4', label: 'Lost', type: 'lost' },
					],
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('leadStatus') // resource
					.mockReturnValueOnce('list'); // operation

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				const result = await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('GET', '/status/lead/');
				expect(result[0]).toHaveLength(1);
				expect(result[0][0]).toHaveLength(4);
			});
		});

		describe('Create Lead Status', () => {
			it('should create a lead status with minimum required fields', async () => {
				const mockResponse = {
					id: 'stat_new123',
					label: 'Hot Prospect',
					type: 'active',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('leadStatus') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('Hot Prospect') // label
					.mockReturnValueOnce({}); // additionalFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				const result = await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/status/lead/', {
					label: 'Hot Prospect',
				});
				expect(result[0]).toHaveLength(1);
			});

			it('should create a lead status with type', async () => {
				const mockResponse = {
					id: 'stat_new123',
					label: 'Closed Won',
					type: 'won',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('leadStatus') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('Closed Won') // label
					.mockReturnValueOnce({ type: 'won' }); // additionalFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/status/lead/', {
					label: 'Closed Won',
					type: 'won',
				});
			});

			it('should throw error when label is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('leadStatus') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce(''); // label (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Label is required for lead status creation',
				);
			});
		});

		describe('Update Lead Status', () => {
			it('should update a lead status', async () => {
				const mockResponse = {
					id: 'stat_123',
					label: 'Updated Prospect',
					type: 'active',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('leadStatus') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce('stat_123') // statusId
					.mockReturnValueOnce('Updated Prospect') // label
					.mockReturnValueOnce({ type: 'active' }); // additionalFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('PUT', '/status/lead/stat_123/', {
					label: 'Updated Prospect',
					type: 'active',
				});
			});

			it('should throw error when status ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('leadStatus') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce(''); // statusId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Status ID is required for update operation',
				);
			});

			it('should throw error when label is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('leadStatus') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce('stat_123') // statusId
					.mockReturnValueOnce(''); // label (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Label is required for update operation',
				);
			});
		});

		describe('Delete Lead Status', () => {
			it('should delete a lead status successfully', async () => {
				const mockResponse = {};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('leadStatus') // resource
					.mockReturnValueOnce('delete') // operation
					.mockReturnValueOnce('stat_123'); // statusId

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('DELETE', '/status/lead/stat_123/');
			});

			it('should throw error when status ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('leadStatus') // resource
					.mockReturnValueOnce('delete') // operation
					.mockReturnValueOnce(''); // statusId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Status ID is required for delete operation',
				);
			});
		});
	});

	describe('Opportunity Status Operations', () => {
		beforeEach(() => {
			mockExecuteFunctions.getInputData.mockReturnValue([{ json: {} }]);
		});

		describe('List Opportunity Statuses', () => {
			it('should list all opportunity statuses', async () => {
				const mockResponse = {
					data: [
						{ id: 'opstat_1', label: 'Qualified', status_type: 'active' },
						{ id: 'opstat_2', label: 'Proposal Sent', status_type: 'active' },
						{ id: 'opstat_3', label: 'Closed Won', status_type: 'won' },
						{ id: 'opstat_4', label: 'Closed Lost', status_type: 'lost' },
					],
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('opportunityStatus') // resource
					.mockReturnValueOnce('list'); // operation

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				const result = await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('GET', '/status/opportunity/');
				expect(result[0]).toHaveLength(1);
				expect(result[0][0]).toHaveLength(4);
			});
		});

		describe('Create Opportunity Status', () => {
			it('should create an opportunity status with minimum required fields', async () => {
				const mockResponse = {
					id: 'opstat_new123',
					label: 'Negotiating',
					status_type: 'active',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('opportunityStatus') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('Negotiating') // label
					.mockReturnValueOnce('active') // statusType
					.mockReturnValueOnce({}); // additionalFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				const result = await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/status/opportunity/', {
					label: 'Negotiating',
					status_type: 'active',
				});
				expect(result[0]).toHaveLength(1);
			});

			it('should create an opportunity status with pipeline ID', async () => {
				const mockResponse = {
					id: 'opstat_new123',
					label: 'Contract Review',
					status_type: 'active',
					pipeline_id: 'pipe_123',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('opportunityStatus') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('Contract Review') // label
					.mockReturnValueOnce('active') // statusType
					.mockReturnValueOnce({ pipelineId: 'pipe_123' }); // additionalFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/status/opportunity/', {
					label: 'Contract Review',
					status_type: 'active',
					pipeline_id: 'pipe_123',
				});
			});

			it('should throw error when label is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('opportunityStatus') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce(''); // label (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Label is required for opportunity status creation',
				);
			});

			it('should throw error when status type is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('opportunityStatus') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('Negotiating') // label
					.mockReturnValueOnce(''); // statusType (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Status Type is required for opportunity status creation',
				);
			});
		});

		describe('Update Opportunity Status', () => {
			it('should update an opportunity status', async () => {
				const mockResponse = {
					id: 'opstat_123',
					label: 'Updated Negotiating',
					status_type: 'active',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('opportunityStatus') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce('opstat_123') // statusId
					.mockReturnValueOnce('Updated Negotiating') // label
					.mockReturnValueOnce({ statusType: 'active' }); // additionalFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('PUT', '/status/opportunity/opstat_123/', {
					label: 'Updated Negotiating',
					status_type: 'active',
				});
			});

			it('should update an opportunity status with pipeline', async () => {
				const mockResponse = {
					id: 'opstat_123',
					label: 'Updated Status',
					status_type: 'won',
					pipeline_id: 'pipe_456',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('opportunityStatus') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce('opstat_123') // statusId
					.mockReturnValueOnce('Updated Status') // label
					.mockReturnValueOnce({
						statusType: 'won',
						pipelineId: 'pipe_456',
					}); // additionalFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('PUT', '/status/opportunity/opstat_123/', {
					label: 'Updated Status',
					status_type: 'won',
					pipeline_id: 'pipe_456',
				});
			});

			it('should throw error when status ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('opportunityStatus') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce(''); // statusId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Status ID is required for update operation',
				);
			});

			it('should throw error when label is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('opportunityStatus') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce('opstat_123') // statusId
					.mockReturnValueOnce(''); // label (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Label is required for update operation',
				);
			});
		});

		describe('Delete Opportunity Status', () => {
			it('should delete an opportunity status successfully', async () => {
				const mockResponse = {};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('opportunityStatus') // resource
					.mockReturnValueOnce('delete') // operation
					.mockReturnValueOnce('opstat_123'); // statusId

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('DELETE', '/status/opportunity/opstat_123/');
			});

			it('should throw error when status ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('opportunityStatus') // resource
					.mockReturnValueOnce('delete') // operation
					.mockReturnValueOnce(''); // statusId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Status ID is required for delete operation',
				);
			});
		});
	});

	describe('Opportunity Operations', () => {
		beforeEach(() => {
			mockExecuteFunctions.getInputData.mockReturnValue([{ json: {} }]);
		});

		describe('Create Opportunity', () => {
			it('should create an opportunity with minimum required fields', async () => {
				const mockResponse = {
					id: 'oppo_abc123',
					lead_id: 'lead_xyz789',
					status_id: 'stat_default',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('opportunity') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId
					.mockReturnValueOnce({}); // additionalFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				const result = await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/opportunity/', {
					lead_id: 'lead_xyz789',
				});
				expect(result[0]).toHaveLength(1);
			});

			it('should create an opportunity with additional fields', async () => {
				const mockResponse = {
					id: 'oppo_abc123',
					lead_id: 'lead_xyz789',
					status_id: 'stat_qualified',
					note: 'Test opportunity',
					value: 10000,
					value_formatted: '$100.00',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('opportunity') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId
					.mockReturnValueOnce({
						statusId: 'stat_qualified',
						note: 'Test opportunity',
						value: 10000,
					}); // additionalFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/opportunity/', {
					lead_id: 'lead_xyz789',
					status_id: 'stat_qualified',
					note: 'Test opportunity',
					value: 10000,
				});
			});


			it('should throw error when lead ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('opportunity') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce(''); // leadId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Lead ID is required for opportunity creation',
				);
			});
		});

		describe('Delete Opportunity', () => {
			it('should delete an opportunity successfully', async () => {
				const mockResponse = {};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('opportunity') // resource
					.mockReturnValueOnce('delete') // operation
					.mockReturnValueOnce('oppo_abc123'); // opportunityId

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('DELETE', '/opportunity/oppo_abc123/');
			});

			it('should throw error when opportunity ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('opportunity') // resource
					.mockReturnValueOnce('delete') // operation
					.mockReturnValueOnce(''); // opportunityId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Opportunity ID is required for delete operation',
				);
			});
		});

		describe('Find Opportunities', () => {
			it('should find opportunities with lead ID filter', async () => {
				const mockResponse = {
					data: [
						{ id: 'oppo_1', lead_id: 'lead_xyz789', status_id: 'stat_active' },
						{ id: 'oppo_2', lead_id: 'lead_xyz789', status_id: 'stat_won' },
					],
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('opportunity') // resource
					.mockReturnValueOnce('find') // operation
				.mockReturnValueOnce('') // opportunityId
				.mockReturnValueOnce('lead_xyz789') // leadId
					.mockReturnValueOnce('') // statusId
					.mockReturnValueOnce('') // assignedTo
					.mockReturnValueOnce('') // statusType
					.mockReturnValueOnce({}) // additionalFilters
					.mockReturnValueOnce(false) // returnAll
					.mockReturnValueOnce(10); // limit

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith(
					'GET',
					'/opportunity/',
					{},
					{ lead_id: 'lead_xyz789', _limit: 10 },
				);
			});

			it('should find all opportunities when returnAll is true', async () => {
				const mockOpportunities = [
					{ id: 'oppo_1', lead_id: 'lead_1', status_id: 'stat_active' },
					{ id: 'oppo_2', lead_id: 'lead_2', status_id: 'stat_won' },
				];

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('opportunity') // resource
					.mockReturnValueOnce('find') // operation
				.mockReturnValueOnce('') // opportunityId
				.mockReturnValueOnce('') // leadId
					.mockReturnValueOnce('') // statusId
					.mockReturnValueOnce('') // assignedTo
					.mockReturnValueOnce('') // statusType
					.mockReturnValueOnce({}) // additionalFilters
					.mockReturnValueOnce(true); // returnAll

				(closeApiRequestAllItems as jest.Mock).mockResolvedValue(mockOpportunities);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequestAllItems).toHaveBeenCalledWith(
					'data',
					'GET',
					'/opportunity/',
					{},
					{},
				);
			});
		});

		describe('Update Opportunity', () => {
			it('should update an opportunity with basic fields', async () => {
				const mockResponse = {
					id: 'oppo_abc123',
					status_id: 'stat_won',
					note: 'Updated note',
					value: 20000,
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('opportunity') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce('oppo_abc123') // opportunityId
					.mockReturnValueOnce({
						statusId: 'stat_won',
						note: 'Updated note',
						value: 20000,
					}); // updateFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('PUT', '/opportunity/oppo_abc123/', {
					status_id: 'stat_won',
					note: 'Updated note',
					value: 20000,
				});
			});

			it('should throw error when opportunity ID is missing for update', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('opportunity') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce(''); // opportunityId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Opportunity ID is required for update operation',
				);
			});
		});
	});

	describe('Call Operations', () => {
		beforeEach(() => {
			mockExecuteFunctions.getInputData.mockReturnValue([{ json: {} }]);
		});

		describe('Create Call', () => {
			it('should create a call with minimum required fields', async () => {
				const mockResponse = {
					id: 'acti_call123',
					lead_id: 'lead_xyz789',
					_type: 'Call',
					status: 'completed',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('call') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId
					.mockReturnValueOnce({}); // additionalFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				const result = await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/activity/call/', {
					lead_id: 'lead_xyz789',
					_type: 'Call',
				});
				expect(result[0]).toHaveLength(1);
			});

			it('should create a call with additional fields', async () => {
				const mockResponse = {
					id: 'acti_call123',
					lead_id: 'lead_xyz789',
					_type: 'Call',
					direction: 'outbound',
					duration: 300,
					note_html: '<p>Great call</p>',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('call') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId
					.mockReturnValueOnce({
						direction: 'outbound',
						duration: 300,
						noteHtml: '<p>Great call</p>',
						phone: '+1234567890',
					}); // additionalFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/activity/call/', {
					lead_id: 'lead_xyz789',
					_type: 'Call',
					direction: 'outbound',
					duration: 300,
					note_html: '<body><p><p>Great call</p></p></body>',
					phone: '+1234567890',
				});
			});

			it('should throw error when lead ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('call') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce(''); // leadId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Lead ID is required for call creation',
				);
			});
		});

		describe('Delete Call', () => {
			it('should delete a call successfully', async () => {
				const mockResponse = {};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('call') // resource
					.mockReturnValueOnce('delete') // operation
					.mockReturnValueOnce('acti_call123'); // callId

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('DELETE', '/activity/call/acti_call123/');
			});

			it('should throw error when call ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('call') // resource
					.mockReturnValueOnce('delete') // operation
					.mockReturnValueOnce(''); // callId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Call ID is required for delete operation',
				);
			});
		});

		describe('Get Call', () => {
			it('should fetch a single call successfully', async () => {
				const mockResponse = {
					id: 'acti_call123',
					lead_id: 'lead_xyz789',
					_type: 'Call',
					direction: 'outbound',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('call') // resource
					.mockReturnValueOnce('get') // operation
					.mockReturnValueOnce('acti_call123'); // callId

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('GET', '/activity/call/acti_call123/');
			});

			it('should throw error when call ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('call') // resource
					.mockReturnValueOnce('get') // operation
					.mockReturnValueOnce(''); // callId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Call ID is required for get operation',
				);
			});
		});

		describe('Update Call', () => {
			it('should update a call with fields', async () => {
				const mockResponse = {
					id: 'acti_call123',
					note_html: '<body><p><p>Updated note</p></p></body>',
					outcome_id: 'outcome_123',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('call') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce('acti_call123') // callId
					.mockReturnValueOnce({
						noteHtml: '<p>Updated note</p>',
						outcomeId: 'outcome_123',
					}); // updateFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('PUT', '/activity/call/acti_call123/', {
					note_html: '<body><p><p>Updated note</p></p></body>',
					outcome_id: 'outcome_123',
				});
			});

			it('should throw error when call ID is missing for update', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('call') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce(''); // callId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Call ID is required for update operation',
				);
			});
		});

		describe('Find Calls', () => {
			it('should find calls with lead ID filter', async () => {
				const mockResponse = {
					data: [
						{ id: 'acti_call1', lead_id: 'lead_xyz789', _type: 'Call' },
						{ id: 'acti_call2', lead_id: 'lead_xyz789', _type: 'Call' },
					],
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('call') // resource
					.mockReturnValueOnce('find') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId
					.mockReturnValueOnce(false) // returnAll
					.mockReturnValueOnce(10); // limit

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith(
					'GET',
					'/activity/',
					{},
					{ lead_id: 'lead_xyz789', _type: 'Call', _limit: 10 },
				);
			});

			it('should find all calls when returnAll is true', async () => {
				const mockCalls = [
					{ id: 'acti_call1', lead_id: 'lead_1', _type: 'Call' },
					{ id: 'acti_call2', lead_id: 'lead_2', _type: 'Call' },
				];

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('call') // resource
					.mockReturnValueOnce('find') // operation
					.mockReturnValueOnce('') // leadId
					.mockReturnValueOnce(true); // returnAll

				(closeApiRequestAllItems as jest.Mock).mockResolvedValue(mockCalls);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequestAllItems).toHaveBeenCalledWith(
					'data',
					'GET',
					'/activity/',
					{},
					{ _type: 'Call' },
				);
			});
		});
	});

	describe('Email Operations', () => {
		beforeEach(() => {
			mockExecuteFunctions.getInputData.mockReturnValue([{ json: {} }]);
		});

		describe('Create Email', () => {
			it('should create an email with minimum required fields', async () => {
				const mockResponse = {
					id: 'acti_email123',
					lead_id: 'lead_xyz789',
					to: ['test@example.com'],
					subject: 'Test Subject',
					status: 'draft',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('email') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId
					.mockReturnValueOnce('test@example.com') // to
					.mockReturnValueOnce('Test Subject') // subject
					.mockReturnValueOnce('draft') // status
					.mockReturnValueOnce({}); // additionalFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				const result = await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/activity/email/', {
					lead_id: 'lead_xyz789',
					to: ['test@example.com'],
					subject: 'Test Subject',
					status: 'draft',
				});
				expect(result[0]).toHaveLength(1);
			});

			it('should create an email with additional fields', async () => {
				const mockResponse = {
					id: 'acti_email123',
					lead_id: 'lead_xyz789',
					to: ['test@example.com'],
					subject: 'Test Subject',
					status: 'outbox',
					body_html: '<p>Test content</p>',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('email') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId
					.mockReturnValueOnce('test@example.com') // to
					.mockReturnValueOnce('Test Subject') // subject
					.mockReturnValueOnce('outbox') // status
					.mockReturnValueOnce({
						bodyHtml: '<p>Test content</p>',
						cc: 'cc1@test.com, cc2@test.com',
						sender: '"John Doe" <john@example.com>',
					}); // additionalFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/activity/email/', {
					lead_id: 'lead_xyz789',
					to: ['test@example.com'],
					subject: 'Test Subject',
					status: 'outbox',
					body_html: '<p>Test content</p>',
					cc: ['cc1@test.com', 'cc2@test.com'],
					sender: '"John Doe" <john@example.com>',
				});
			});

			it('should throw error when required fields are missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('email') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce(''); // leadId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Lead ID is required for email creation',
				);
			});
		});

		describe('Delete Email', () => {
			it('should delete an email successfully', async () => {
				const mockResponse = {};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('email') // resource
					.mockReturnValueOnce('delete') // operation
					.mockReturnValueOnce('acti_email123'); // emailId

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('DELETE', '/activity/email/acti_email123/');
			});

			it('should throw error when email ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('email') // resource
					.mockReturnValueOnce('delete') // operation
					.mockReturnValueOnce(''); // emailId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Email ID is required for delete operation',
				);
			});
		});

		describe('Get Email', () => {
			it('should fetch a single email successfully', async () => {
				const mockResponse = {
					id: 'acti_email123',
					lead_id: 'lead_xyz789',
					subject: 'Test Subject',
					status: 'sent',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('email') // resource
					.mockReturnValueOnce('get') // operation
					.mockReturnValueOnce('acti_email123'); // emailId

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('GET', '/activity/email/acti_email123/');
			});

			it('should throw error when email ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('email') // resource
					.mockReturnValueOnce('get') // operation
					.mockReturnValueOnce(''); // emailId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Email ID is required for get operation',
				);
			});
		});

		describe('Update Email', () => {
			it('should update an email with fields', async () => {
				const mockResponse = {
					id: 'acti_email123',
					subject: 'Updated Subject',
					status: 'outbox',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('email') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce('acti_email123') // emailId
					.mockReturnValueOnce({
						subject: 'Updated Subject',
						status: 'outbox',
						bodyHtml: '<p>Updated content</p>',
					}); // updateFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('PUT', '/activity/email/acti_email123/', {
					subject: 'Updated Subject',
					status: 'outbox',
					body_html: '<p>Updated content</p>',
				});
			});

			it('should throw error when email ID is missing for update', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('email') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce(''); // emailId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Email ID is required for update operation',
				);
			});
		});

		describe('Find Emails', () => {
			it('should find emails with lead ID filter', async () => {
				const mockResponse = {
					data: [
						{ id: 'acti_email1', lead_id: 'lead_xyz789', subject: 'Email 1' },
						{ id: 'acti_email2', lead_id: 'lead_xyz789', subject: 'Email 2' },
					],
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('email') // resource
					.mockReturnValueOnce('find') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId
					.mockReturnValueOnce(false) // returnAll
					.mockReturnValueOnce(10); // limit

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith(
					'GET',
					'/activity/email/',
					{},
					{ lead_id: 'lead_xyz789', _limit: 10 },
				);
			});

			it('should find all emails when returnAll is true', async () => {
				const mockEmails = [
					{ id: 'acti_email1', lead_id: 'lead_1', subject: 'Email 1' },
					{ id: 'acti_email2', lead_id: 'lead_2', subject: 'Email 2' },
				];

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('email') // resource
					.mockReturnValueOnce('find') // operation
					.mockReturnValueOnce('') // leadId
					.mockReturnValueOnce(true); // returnAll

				(closeApiRequestAllItems as jest.Mock).mockResolvedValue(mockEmails);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequestAllItems).toHaveBeenCalledWith(
					'data',
					'GET',
					'/activity/email/',
					{},
					{},
				);
			});
		});
	});

	describe('Meeting Operations', () => {
		beforeEach(() => {
			mockExecuteFunctions.getInputData.mockReturnValue([{ json: {} }]);
		});

		describe('Delete Meeting', () => {
			it('should delete a meeting successfully', async () => {
				const mockResponse = {};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('meeting') // resource
					.mockReturnValueOnce('delete') // operation
					.mockReturnValueOnce('acti_meeting123'); // meetingId

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith(
					'DELETE',
					'/activity/meeting/acti_meeting123/',
				);
			});

			it('should throw error when meeting ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('meeting') // resource
					.mockReturnValueOnce('delete') // operation
					.mockReturnValueOnce(''); // meetingId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Meeting ID is required for delete operation',
				);
			});
		});

		describe('Get Meeting', () => {
			it('should fetch a single meeting successfully', async () => {
				const mockResponse = {
					id: 'acti_meeting123',
					lead_id: 'lead_xyz789',
					title: 'Sales Meeting',
					status: 'completed',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('meeting') // resource
					.mockReturnValueOnce('get') // operation
					.mockReturnValueOnce('acti_meeting123') // meetingId
					.mockReturnValueOnce({}); // additionalOptions

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith(
					'GET',
					'/activity/meeting/acti_meeting123/',
					{},
					{},
				);
			});

			it('should fetch a meeting with transcripts', async () => {
				const mockResponse = {
					id: 'acti_meeting123',
					lead_id: 'lead_xyz789',
					title: 'Sales Meeting',
					transcripts: [
						{
							utterances: [
								{
									speaker_label: 'John Lead',
									speaker_side: 'contact',
									text: 'Hello there',
								},
							],
						},
					],
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('meeting') // resource
					.mockReturnValueOnce('get') // operation
					.mockReturnValueOnce('acti_meeting123') // meetingId
					.mockReturnValueOnce({ includeTranscripts: true }); // additionalOptions

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith(
					'GET',
					'/activity/meeting/acti_meeting123/',
					{},
					{ _fields: 'transcripts' },
				);
			});

			it('should throw error when meeting ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('meeting') // resource
					.mockReturnValueOnce('get') // operation
					.mockReturnValueOnce(''); // meetingId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Meeting ID is required for get operation',
				);
			});
		});

		describe('Update Meeting', () => {
			it('should update a meeting with fields', async () => {
				const mockResponse = {
					id: 'acti_meeting123',
					user_note_html: '<body><p>Great meeting with promising lead</p></body>',
					outcome_id: 'outcome_456',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('meeting') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce('acti_meeting123') // meetingId
					.mockReturnValueOnce({
						userNote: 'Great meeting with promising lead',
						outcomeId: 'outcome_456',
					}); // updateFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('PUT', '/activity/meeting/acti_meeting123/', {
					user_note_html: '<body><p>Great meeting with promising lead</p></body>',
					outcome_id: 'outcome_456',
				});
			});

			it('should throw error when meeting ID is missing for update', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('meeting') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce(''); // meetingId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Meeting ID is required for update operation',
				);
			});
		});

		describe('Find Meetings', () => {
			it('should find meetings with lead ID filter', async () => {
				const mockResponse = {
					data: [
						{ id: 'acti_meeting1', lead_id: 'lead_xyz789', title: 'Meeting 1' },
						{ id: 'acti_meeting2', lead_id: 'lead_xyz789', title: 'Meeting 2' },
					],
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('meeting') // resource
					.mockReturnValueOnce('find') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId
					.mockReturnValueOnce('') // userId
					.mockReturnValueOnce(false) // returnAll
					.mockReturnValueOnce({}) // additionalFilters
					.mockReturnValueOnce(10); // limit

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith(
					'GET',
					'/activity/meeting/',
					{},
					{ lead_id: 'lead_xyz789', _limit: 10 },
				);
			});

			it('should find meetings with date filters', async () => {
				const mockResponse = {
					data: [{ id: 'acti_meeting1', lead_id: 'lead_xyz789', title: 'Recent Meeting' }],
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('meeting') // resource
					.mockReturnValueOnce('find') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId
					.mockReturnValueOnce('') // userId
					.mockReturnValueOnce(false) // returnAll
					.mockReturnValueOnce({
						dateCreatedGt: '2024-01-01T00:00:00Z',
						dateCreatedLt: '2024-12-31T23:59:59Z',
					}) // additionalFilters
					.mockReturnValueOnce(25); // limit

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith(
					'GET',
					'/activity/meeting/',
					{},
					{
						lead_id: 'lead_xyz789',
						date_created__gt: '2024-01-01T00:00:00Z',
						date_created__lt: '2024-12-31T23:59:59Z',
						_limit: 25,
					},
				);
			});

			it('should find all meetings when returnAll is true', async () => {
				const mockMeetings = [
					{ id: 'acti_meeting1', lead_id: 'lead_1', title: 'Meeting 1' },
					{ id: 'acti_meeting2', lead_id: 'lead_2', title: 'Meeting 2' },
				];

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('meeting') // resource
					.mockReturnValueOnce('find') // operation
					.mockReturnValueOnce('') // leadId
					.mockReturnValueOnce('') // userId
					.mockReturnValueOnce(true) // returnAll
					.mockReturnValueOnce({}); // additionalFilters

				(closeApiRequestAllItems as jest.Mock).mockResolvedValue(mockMeetings);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequestAllItems).toHaveBeenCalledWith('data', 'GET', '/activity/meeting/', {}, {});
			});
		});
	});

	describe('Note Operations', () => {
		beforeEach(() => {
			mockExecuteFunctions.getInputData.mockReturnValue([{ json: {} }]);
		});

		describe('Create Note', () => {
			it('should create a note with plain text content', async () => {
				const mockResponse = {
					id: 'acti_note123',
					lead_id: 'lead_xyz789',
					note: 'This is a plain text note',
					_type: 'Note',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('note') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId
					.mockReturnValueOnce('text') // noteContentType
					.mockReturnValueOnce('This is a plain text note'); // note

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				const result = await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/activity/note/', {
					lead_id: 'lead_xyz789',
					_type: 'Note',
					note: 'This is a plain text note',
				});
				expect(result[0]).toHaveLength(1);
			});

			it('should create a note with HTML content', async () => {
				const mockResponse = {
					id: 'acti_note123',
					lead_id: 'lead_xyz789',
					note_html: '<p>This is a <strong>rich text</strong> note</p>',
					_type: 'Note',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('note') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId
					.mockReturnValueOnce('html') // noteContentType
					.mockReturnValueOnce('<p>This is a <strong>rich text</strong> note</p>'); // noteHtml

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/activity/note/', {
					lead_id: 'lead_xyz789',
					_type: 'Note',
					note_html: '<body><p><p>This is a <strong>rich text</strong> note</p></p></body>',
				});
			});

			it('should throw error when lead ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('note') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce(''); // leadId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Lead ID is required for note creation',
				);
			});

			it('should throw error when note content is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('note') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId
					.mockReturnValueOnce('text') // noteContentType
					.mockReturnValueOnce(''); // note (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Note content is required',
				);
			});
		});

		describe('Delete Note', () => {
			it('should delete a note successfully', async () => {
				const mockResponse = {};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('note') // resource
					.mockReturnValueOnce('delete') // operation
					.mockReturnValueOnce('acti_note123'); // noteId

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('DELETE', '/activity/note/acti_note123/');
			});

			it('should throw error when note ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('note') // resource
					.mockReturnValueOnce('delete') // operation
					.mockReturnValueOnce(''); // noteId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Note ID is required for delete operation',
				);
			});
		});

		describe('Get Note', () => {
			it('should fetch a single note successfully', async () => {
				const mockResponse = {
					id: 'acti_note123',
					lead_id: 'lead_xyz789',
					note: 'This is a note',
					note_html: '<p>This is a note</p>',
					_type: 'Note',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('note') // resource
					.mockReturnValueOnce('get') // operation
					.mockReturnValueOnce('acti_note123'); // noteId

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('GET', '/activity/note/acti_note123/');
			});

			it('should throw error when note ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('note') // resource
					.mockReturnValueOnce('get') // operation
					.mockReturnValueOnce(''); // noteId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Note ID is required for get operation',
				);
			});
		});

		describe('Update Note', () => {
			it('should update a note with plain text', async () => {
				const mockResponse = {
					id: 'acti_note123',
					note: 'Updated note content',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('note') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce('acti_note123') // noteId
					.mockReturnValueOnce('text') // updateContentType
					.mockReturnValueOnce('Updated note content'); // note

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('PUT', '/activity/note/acti_note123/', {
					note: 'Updated note content',
				});
			});

			it('should update a note with HTML content', async () => {
				const mockResponse = {
					id: 'acti_note123',
					note_html: '<body><p><p>Updated <em>rich</em> content</p></p></body>',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('note') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce('acti_note123') // noteId
					.mockReturnValueOnce('html') // updateContentType
					.mockReturnValueOnce('<p>Updated <em>rich</em> content</p>'); // noteHtml

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('PUT', '/activity/note/acti_note123/', {
					note_html: '<body><p><p>Updated <em>rich</em> content</p></p></body>',
				});
			});

			it('should throw error when note ID is missing for update', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('note') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce(''); // noteId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Note ID is required for update operation',
				);
			});
		});

		describe('Find Notes', () => {
			it('should find notes with lead ID filter', async () => {
				const mockResponse = {
					data: [
						{ id: 'acti_note1', lead_id: 'lead_xyz789', note: 'Note 1' },
						{ id: 'acti_note2', lead_id: 'lead_xyz789', note: 'Note 2' },
					],
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('note') // resource
					.mockReturnValueOnce('find') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId
					.mockReturnValueOnce('') // userId
					.mockReturnValueOnce(false) // returnAll
					.mockReturnValueOnce({}) // additionalFilters
					.mockReturnValueOnce(10); // limit

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith(
					'GET',
					'/activity/note/',
					{},
					{ lead_id: 'lead_xyz789', _limit: 10 },
				);
			});

			it('should find notes with date filters', async () => {
				const mockResponse = {
					data: [{ id: 'acti_note1', lead_id: 'lead_xyz789', note: 'Recent note' }],
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('note') // resource
					.mockReturnValueOnce('find') // operation
					.mockReturnValueOnce('') // leadId
					.mockReturnValueOnce('user_123') // userId
					.mockReturnValueOnce(false) // returnAll
					.mockReturnValueOnce({
						dateCreatedGt: '2024-01-01T00:00:00Z',
						dateCreatedLt: '2024-12-31T23:59:59Z',
					}) // additionalFilters
					.mockReturnValueOnce(25); // limit

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith(
					'GET',
					'/activity/note/',
					{},
					{
						user_id: 'user_123',
						date_created__gt: '2024-01-01T00:00:00Z',
						date_created__lt: '2024-12-31T23:59:59Z',
						_limit: 25,
					},
				);
			});

			it('should find all notes when returnAll is true', async () => {
				const mockNotes = [
					{ id: 'acti_note1', lead_id: 'lead_1', note: 'Note 1' },
					{ id: 'acti_note2', lead_id: 'lead_2', note: 'Note 2' },
				];

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('note') // resource
					.mockReturnValueOnce('find') // operation
					.mockReturnValueOnce('') // leadId
					.mockReturnValueOnce('') // userId
					.mockReturnValueOnce(true) // returnAll
					.mockReturnValueOnce({}); // additionalFilters

				(closeApiRequestAllItems as jest.Mock).mockResolvedValue(mockNotes);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequestAllItems).toHaveBeenCalledWith(
					'data',
					'GET',
					'/activity/note/',
					{},
					{},
				);
			});
		});
	});

	describe('SMS Operations', () => {
		beforeEach(() => {
			mockExecuteFunctions.getInputData.mockReturnValue([{ json: {} }]);
		});

		describe('Create SMS', () => {
			it('should create an SMS with minimum required fields', async () => {
				const mockResponse = {
					id: 'acti_sms123',
					lead_id: 'lead_xyz789',
					to: ['+1234567890'],
					local_phone: '+0987654321',
					status: 'draft',
					text: 'Hello from Close CRM',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('sms') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId
					.mockReturnValueOnce('+1234567890') // to
					.mockReturnValueOnce('+0987654321') // localPhone
					.mockReturnValueOnce('draft') // status
					.mockReturnValueOnce('Hello from Close CRM') // text
					.mockReturnValueOnce({}); // additionalFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				const result = await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith(
					'POST',
					'/activity/sms/',
					{
						lead_id: 'lead_xyz789',
						to: ['+1234567890'],
						local_phone: '+0987654321',
						status: 'draft',
						text: 'Hello from Close CRM',
					},
					{},
				);
				expect(result[0]).toHaveLength(1);
			});

			it('should create an SMS with additional fields', async () => {
				const mockResponse = {
					id: 'acti_sms123',
					lead_id: 'lead_xyz789',
					to: ['+1234567890'],
					local_phone: '+0987654321',
					status: 'scheduled',
					text: 'Scheduled follow-up message',
					date_scheduled: '2024-01-15T10:00:00Z',
					direction: 'outbound',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('sms') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId
					.mockReturnValueOnce('+1234567890') // to
					.mockReturnValueOnce('+0987654321') // localPhone
					.mockReturnValueOnce('scheduled') // status
					.mockReturnValueOnce('Scheduled follow-up message') // text
					.mockReturnValueOnce({
						dateScheduled: '2024-01-15T10:00:00Z',
						direction: 'outbound',
						sendIn: 30,
					}); // additionalFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith(
					'POST',
					'/activity/sms/',
					{
						lead_id: 'lead_xyz789',
						to: ['+1234567890'],
						local_phone: '+0987654321',
						status: 'scheduled',
						text: 'Scheduled follow-up message',
						date_scheduled: '2024-01-15T10:00:00Z',
						direction: 'outbound',
						send_in: 30,
					},
					{},
				);
			});

			it('should create an SMS with template instead of text', async () => {
				const mockResponse = {
					id: 'acti_sms123',
					lead_id: 'lead_xyz789',
					template_id: 'tmpl_123',
					status: 'outbox',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('sms') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId
					.mockReturnValueOnce('+1234567890') // to
					.mockReturnValueOnce('+0987654321') // localPhone
					.mockReturnValueOnce('outbox') // status
					.mockReturnValueOnce('This will be ignored') // text
					.mockReturnValueOnce({ templateId: 'tmpl_123' }); // additionalFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith(
					'POST',
					'/activity/sms/',
					{
						lead_id: 'lead_xyz789',
						to: ['+1234567890'],
						local_phone: '+0987654321',
						status: 'outbox',
						template_id: 'tmpl_123',
					},
					{},
				);
			});

			it('should create an SMS with send_to_inbox parameter', async () => {
				const mockResponse = {
					id: 'acti_sms123',
					lead_id: 'lead_xyz789',
					status: 'inbox',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('sms') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId
					.mockReturnValueOnce('+1234567890') // to
					.mockReturnValueOnce('+0987654321') // localPhone
					.mockReturnValueOnce('inbox') // status
					.mockReturnValueOnce('Received message') // text
					.mockReturnValueOnce({ sendToInbox: true }); // additionalFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith(
					'POST',
					'/activity/sms/',
					{
						lead_id: 'lead_xyz789',
						to: ['+1234567890'],
						local_phone: '+0987654321',
						status: 'inbox',
						text: 'Received message',
					},
					{ send_to_inbox: 'true' },
				);
			});

			it('should throw error when required fields are missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('sms') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce(''); // leadId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Lead ID is required for SMS creation',
				);
			});
		});

		describe('Delete SMS', () => {
			it('should delete an SMS successfully', async () => {
				const mockResponse = {};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('sms') // resource
					.mockReturnValueOnce('delete') // operation
					.mockReturnValueOnce('acti_sms123'); // smsId

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('DELETE', '/activity/sms/acti_sms123/');
			});

			it('should throw error when SMS ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('sms') // resource
					.mockReturnValueOnce('delete') // operation
					.mockReturnValueOnce(''); // smsId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'SMS ID is required for delete operation',
				);
			});
		});

		describe('Get SMS', () => {
			it('should fetch a single SMS successfully', async () => {
				const mockResponse = {
					id: 'acti_sms123',
					lead_id: 'lead_xyz789',
					to: ['+1234567890'],
					text: 'SMS content',
					status: 'sent',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('sms') // resource
					.mockReturnValueOnce('get') // operation
					.mockReturnValueOnce('acti_sms123'); // smsId

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('GET', '/activity/sms/acti_sms123/');
			});

			it('should throw error when SMS ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('sms') // resource
					.mockReturnValueOnce('get') // operation
					.mockReturnValueOnce(''); // smsId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'SMS ID is required for get operation',
				);
			});
		});

		describe('Update SMS', () => {
			it('should update an SMS with fields', async () => {
				const mockResponse = {
					id: 'acti_sms123',
					text: 'Updated SMS content',
					status: 'outbox',
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('sms') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce('acti_sms123') // smsId
					.mockReturnValueOnce({
						text: 'Updated SMS content',
						status: 'outbox',
						dateScheduled: '2024-01-20T15:00:00Z',
					}); // updateFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('PUT', '/activity/sms/acti_sms123/', {
					text: 'Updated SMS content',
					status: 'outbox',
					date_scheduled: '2024-01-20T15:00:00Z',
				});
			});

			it('should throw error when SMS ID is missing for update', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('sms') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce(''); // smsId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'SMS ID is required for update operation',
				);
			});
		});

		describe('Find SMS', () => {
			it('should find SMS with lead ID filter', async () => {
				const mockResponse = {
					data: [
						{ id: 'acti_sms1', lead_id: 'lead_xyz789', text: 'SMS 1' },
						{ id: 'acti_sms2', lead_id: 'lead_xyz789', text: 'SMS 2' },
					],
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('sms') // resource
					.mockReturnValueOnce('find') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId
					.mockReturnValueOnce('') // userId
					.mockReturnValueOnce(false) // returnAll
					.mockReturnValueOnce({}) // additionalFilters
					.mockReturnValueOnce(10); // limit

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith(
					'GET',
					'/activity/sms/',
					{},
					{ lead_id: 'lead_xyz789', _limit: 10 },
				);
			});

			it('should find SMS with date filters', async () => {
				const mockResponse = {
					data: [{ id: 'acti_sms1', lead_id: 'lead_xyz789', text: 'Recent SMS' }],
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('sms') // resource
					.mockReturnValueOnce('find') // operation
					.mockReturnValueOnce('') // leadId
					.mockReturnValueOnce('user_123') // userId
					.mockReturnValueOnce(false) // returnAll
					.mockReturnValueOnce({
						dateCreatedGt: '2024-01-01T00:00:00Z',
						dateCreatedLt: '2024-12-31T23:59:59Z',
					}) // additionalFilters
					.mockReturnValueOnce(25); // limit

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith(
					'GET',
					'/activity/sms/',
					{},
					{
						user_id: 'user_123',
						date_created__gt: '2024-01-01T00:00:00Z',
						date_created__lt: '2024-12-31T23:59:59Z',
						_limit: 25,
					},
				);
			});

			it('should find all SMS when returnAll is true', async () => {
				const mockSms = [
					{ id: 'acti_sms1', lead_id: 'lead_1', text: 'SMS 1' },
					{ id: 'acti_sms2', lead_id: 'lead_2', text: 'SMS 2' },
				];

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('sms') // resource
					.mockReturnValueOnce('find') // operation
					.mockReturnValueOnce('') // leadId
					.mockReturnValueOnce('') // userId
					.mockReturnValueOnce(true) // returnAll
					.mockReturnValueOnce({}); // additionalFilters

				(closeApiRequestAllItems as jest.Mock).mockResolvedValue(mockSms);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequestAllItems).toHaveBeenCalledWith(
					'data',
					'GET',
					'/activity/sms/',
					{},
					{},
				);
			});
		});
	});

	describe('Task Operations', () => {
		beforeEach(() => {
			mockExecuteFunctions.getInputData.mockReturnValue([{ json: {} }]);
		});

		describe('Create Task', () => {
			it('should create a task with minimum required fields', async () => {
				const mockResponse = {
					id: 'task_123',
					lead_id: 'lead_xyz789',
					text: 'Follow up with customer',
					_type: 'lead',
					is_complete: false,
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('task') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId (for i=0)
					.mockReturnValueOnce('Follow up with customer') // text (for i=0)
					.mockReturnValueOnce('2024-01-15T10:00:00Z') // date (for i=0)
					.mockReturnValueOnce(''); // assignedTo (for i=0)

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				const result = await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/task/', {
					lead_id: 'lead_xyz789',
					text: 'Follow up with customer',
					date: '2024-01-15T10:00:00Z',
				});
				expect(result[0]).toHaveLength(1);
			});

			it('should create a task with additional fields', async () => {
				const mockResponse = {
					id: 'task_123',
					lead_id: 'lead_xyz789',
					text: 'Schedule demo call',
					_type: 'lead',
					assigned_to: 'user_123',
					date: '2024-01-15T10:00:00Z',
					is_complete: false,
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('task') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce('lead_xyz789') // leadId (for i=0)
					.mockReturnValueOnce('Schedule demo call') // text (for i=0)
					.mockReturnValueOnce('2024-01-15T10:00:00Z') // date (for i=0)
					.mockReturnValueOnce('user_123'); // assignedTo (for i=0)

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('POST', '/task/', {
					lead_id: 'lead_xyz789',
					text: 'Schedule demo call',
					date: '2024-01-15T10:00:00Z',
					assigned_to: 'user_123',
				});
			});

			it('should throw error when required fields are missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('task') // resource
					.mockReturnValueOnce('create') // operation
					.mockReturnValueOnce(''); // leadId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Lead ID is required for task creation',
				);
			});
		});

		describe('Delete Task', () => {
			it('should delete a task successfully', async () => {
				const mockResponse = {};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('task') // resource
					.mockReturnValueOnce('delete') // operation
					.mockReturnValueOnce('task_123'); // taskId

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('DELETE', '/task/task_123/');
			});

			it('should throw error when task ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('task') // resource
					.mockReturnValueOnce('delete') // operation
					.mockReturnValueOnce(''); // taskId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Task ID is required for delete operation',
				);
			});
		});

		describe('Get Task', () => {
			it('should fetch a single task successfully', async () => {
				const mockResponse = {
					id: 'task_123',
					lead_id: 'lead_xyz789',
					text: 'Follow up with customer',
					_type: 'lead',
					is_complete: false,
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('task') // resource
					.mockReturnValueOnce('get') // operation
					.mockReturnValueOnce('task_123'); // taskId

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('GET', '/task/task_123/');
			});

			it('should throw error when task ID is missing', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('task') // resource
					.mockReturnValueOnce('get') // operation
					.mockReturnValueOnce(''); // taskId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Task ID is required for get operation',
				);
			});
		});

		describe('Update Task', () => {
			it('should update a task with all fields', async () => {
				const mockResponse = {
					id: 'task_123',
					text: 'Updated task description',
					assigned_to: 'user_456',
					date: '2024-01-20T15:00:00Z',
					is_complete: true,
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('task') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce('task_123') // taskId
					.mockReturnValueOnce({
						text: 'Updated task description',
						assignedTo: 'user_456',
						date: '2024-01-20T15:00:00Z',
						isComplete: true,
					}); // updateFields

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith('PUT', '/task/task_123/', {
					text: 'Updated task description',
					assigned_to: 'user_456',
					date: '2024-01-20T15:00:00Z',
					is_complete: true,
				});
			});

			it('should throw error when task ID is missing for update', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('task') // resource
					.mockReturnValueOnce('update') // operation
					.mockReturnValueOnce(''); // taskId (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'Task ID is required for update operation',
				);
			});
		});


		describe('Bulk Update Tasks', () => {
			it('should bulk update tasks by IDs', async () => {
				const mockResponse = {
					updated: 3,
					tasks: [
						{ id: 'task_1', assigned_to: 'user_456' },
						{ id: 'task_2', assigned_to: 'user_456' },
						{ id: 'task_3', assigned_to: 'user_456' },
					],
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('task') // resource
					.mockReturnValueOnce('bulkUpdate') // operation
					.mockReturnValueOnce({
						taskIds: 'task_1,task_2,task_3',
					}) // bulkFilters
					.mockReturnValueOnce({
						assignedTo: 'user_456',
						isComplete: true,
					}); // bulkUpdateData

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith(
					'PUT',
					'/task/',
					{
						assigned_to: 'user_456',
						is_complete: true,
					},
					{
						id__in: 'task_1,task_2,task_3',
					},
				);
			});

			it('should bulk update tasks by filters', async () => {
				const mockResponse = {
					updated: 5,
					tasks: [{ id: 'task_1' }, { id: 'task_2' }],
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('task') // resource
					.mockReturnValueOnce('bulkUpdate') // operation
					.mockReturnValueOnce({
						leadId: 'lead_xyz789',
						isComplete: false,
						taskType: 'lead',
					}) // bulkFilters
					.mockReturnValueOnce({
						date: '2024-01-20T10:00:00Z',
					}); // bulkUpdateData

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith(
					'PUT',
					'/task/',
					{
						date: '2024-01-20T10:00:00Z',
					},
					{
						lead_id: 'lead_xyz789',
						is_complete: false,
						_type: 'lead',
					},
				);
			});

			it('should throw error when no update fields are provided', async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('task') // resource
					.mockReturnValueOnce('bulkUpdate') // operation
					.mockReturnValueOnce({ taskIds: 'task_1,task_2' }) // bulkFilters
					.mockReturnValueOnce({}); // bulkUpdateData (empty)

				mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

				await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
					'At least one update field must be provided for bulk update',
				);
			});
		});
	});

	describe('Sequence Operations', () => {
		beforeEach(() => {
			mockExecuteFunctions.getInputData.mockReturnValue([{ json: {} }]);
		});

		it('should list sequences with a limit', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({
				data: [{ id: 'seq_1' }, { id: 'seq_2' }],
				has_more: false,
			});

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('sequence') // resource
				.mockReturnValueOnce('find') // operation
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce(25); // limit

			await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith('GET', '/sequence/', {}, { _limit: 25 });
		});

		it('should fetch a single sequence', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({ id: 'seq_abc' });

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('sequence')
				.mockReturnValueOnce('get')
				.mockReturnValueOnce('seq_abc');

			await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith('GET', '/sequence/seq_abc/');
		});

		it('should create a sequence parsing JSON schedule and steps', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({ id: 'seq_new' });

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('sequence')
				.mockReturnValueOnce('create')
				.mockReturnValueOnce('My Sequence') // name
				.mockReturnValueOnce('America/Los_Angeles') // timezone
				.mockReturnValueOnce('{"ranges":[{"weekday":1,"start":"09:00","end":"17:00"}]}')
				.mockReturnValueOnce(
					'[{"step_type":"email","delay":0,"required":true,"email_template_id":"tmpl_1"}]',
				);

			await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith('POST', '/sequence/', {
				name: 'My Sequence',
				timezone: 'America/Los_Angeles',
				schedule: { ranges: [{ weekday: 1, start: '09:00', end: '17:00' }] },
				steps: [
					{ step_type: 'email', delay: 0, required: true, email_template_id: 'tmpl_1' },
				],
			});
		});

		it('should fail to create a sequence without a name', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('sequence')
				.mockReturnValueOnce('create')
				.mockReturnValueOnce('') // name
				.mockReturnValueOnce('UTC')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('');

			mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

			await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
				'Name is required to create a sequence',
			);
		});

		it('should fail with a clear message on invalid JSON in schedule', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('sequence')
				.mockReturnValueOnce('create')
				.mockReturnValueOnce('Sequence')
				.mockReturnValueOnce('UTC')
				.mockReturnValueOnce('{not valid json')
				.mockReturnValueOnce('');

			mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

			await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
				/Invalid JSON in field "Schedule"/,
			);
		});

		it('should update a sequence with partial fields', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({ id: 'seq_abc' });

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('sequence')
				.mockReturnValueOnce('update')
				.mockReturnValueOnce('seq_abc')
				.mockReturnValueOnce({ name: 'Renamed', status: 'paused' });

			await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith('PUT', '/sequence/seq_abc/', {
				name: 'Renamed',
				status: 'paused',
			});
		});

		it('should delete a sequence and return success object', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({});

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('sequence')
				.mockReturnValueOnce('delete')
				.mockReturnValueOnce('seq_abc');

			const result = await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith('DELETE', '/sequence/seq_abc/');
			expect(result[0]).toHaveLength(1);
		});

		it('should subscribe a contact to a sequence', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({ id: 'sub_1' });

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('sequence')
				.mockReturnValueOnce('subscribe')
				.mockReturnValueOnce('seq_1') // sequenceId
				.mockReturnValueOnce('cont_1') // contactId
				.mockReturnValueOnce('contact@example.com')
				.mockReturnValueOnce('emailacc_1') // senderAccountId
				.mockReturnValueOnce('Sales Rep') // senderName
				.mockReturnValueOnce('rep@example.com')
				.mockReturnValueOnce({ callsAssignedTo: 'user_1, user_2' });

			await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith('POST', '/sequence_subscription/', {
				sequence_id: 'seq_1',
				contact_id: 'cont_1',
				contact_email: 'contact@example.com',
				sender_account_id: 'emailacc_1',
				sender_name: 'Sales Rep',
				sender_email: 'rep@example.com',
				calls_assigned_to: ['user_1', 'user_2'],
			});
		});

		it('should pause a subscription', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({ id: 'sub_1', status: 'paused' });

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('sequence')
				.mockReturnValueOnce('updateSubscription')
				.mockReturnValueOnce('sub_1')
				.mockReturnValueOnce('paused');

			await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith('PUT', '/sequence_subscription/sub_1/', {
				status: 'paused',
			});
		});

		it('should require at least one filter to list subscriptions', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('sequence')
				.mockReturnValueOnce('findSubscriptions')
				.mockReturnValueOnce({}) // filters
				.mockReturnValueOnce(false); // returnAll

			mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

			await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
				/At least one of Sequence ID, Contact ID, or Lead ID/,
			);
		});

		it('should list subscriptions filtered by sequence', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({ data: [], has_more: false });

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('sequence')
				.mockReturnValueOnce('findSubscriptions')
				.mockReturnValueOnce({ sequenceId: 'seq_1' })
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(50);

			await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith(
				'GET',
				'/sequence_subscription/',
				{},
				{ sequence_id: 'seq_1', _limit: 50 },
			);
		});
	});

	describe('Bulk Action Operations', () => {
		beforeEach(() => {
			mockExecuteFunctions.getInputData.mockReturnValue([{ json: {} }]);
		});

		it('should send a bulk email', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({ id: 'bulkemail_1' });

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('bulkAction')
				.mockReturnValueOnce('createEmail')
				.mockReturnValueOnce('tmpl_1') // templateId
				.mockReturnValueOnce('emailacc_1') // emailAccountId
				.mockReturnValueOnce('lead') // contactPreference
				.mockReturnValueOnce('{"type":"and","queries":[]}')
				.mockReturnValueOnce({ sendDoneEmail: false, sender: 'sender@example.com' });

			await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith('POST', '/bulk_action/email/', {
				template_id: 'tmpl_1',
				email_account_id: 'emailacc_1',
				contact_preference: 'lead',
				s_query: { type: 'and', queries: [] },
				sender: 'sender@example.com',
				send_done_email: false,
			});
		});

		it('should require template ID for bulk email', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('bulkAction')
				.mockReturnValueOnce('createEmail')
				.mockReturnValueOnce('') // templateId missing
				.mockReturnValueOnce('emailacc_1')
				.mockReturnValueOnce('lead')
				.mockReturnValueOnce('{}')
				.mockReturnValueOnce({});

			mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

			await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
				/Template ID and Email Account ID/,
			);
		});

		it('should bulk edit lead status', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({ id: 'bulkedit_1' });

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('bulkAction')
				.mockReturnValueOnce('createEdit')
				.mockReturnValueOnce('set_lead_status') // editType
				.mockReturnValueOnce('stat_1') // leadStatusId
				.mockReturnValueOnce('{"type":"and","queries":[]}') // sQuery
				.mockReturnValueOnce({ sendDoneEmail: true });

			await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith('POST', '/bulk_action/edit/', {
				type: 'set_lead_status',
				lead_status_id: 'stat_1',
				s_query: { type: 'and', queries: [] },
				send_done_email: true,
			});
		});

		it('should bulk edit set custom field with operation', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({ id: 'bulkedit_2' });

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('bulkAction')
				.mockReturnValueOnce('createEdit')
				.mockReturnValueOnce('set_custom_field')
				.mockReturnValueOnce('cf_1') // customFieldId
				.mockReturnValueOnce('new value') // customFieldValue
				.mockReturnValueOnce('replace') // customFieldOperation
				.mockReturnValueOnce('{}') // sQuery
				.mockReturnValueOnce({});

			await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith('POST', '/bulk_action/edit/', {
				type: 'set_custom_field',
				custom_field_id: 'cf_1',
				custom_field_value: 'new value',
				custom_field_operation: 'replace',
				s_query: {},
			});
		});

		it('should require s_query for bulk delete', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('bulkAction')
				.mockReturnValueOnce('createDelete')
				.mockReturnValueOnce('') // sQuery empty
				.mockReturnValueOnce({});

			mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

			await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
				/Search Query \(s_query\) is required for bulk delete/,
			);
		});

		it('should bulk delete with s_query', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({ id: 'bulkdel_1' });

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('bulkAction')
				.mockReturnValueOnce('createDelete')
				.mockReturnValueOnce('{"type":"and","queries":[{"object_type":"lead"}]}')
				.mockReturnValueOnce({});

			await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith('POST', '/bulk_action/delete/', {
				s_query: { type: 'and', queries: [{ object_type: 'lead' }] },
			});
		});

		it('should run bulk sequence subscription (subscribe)', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({ id: 'bulksub_1' });

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('bulkAction')
				.mockReturnValueOnce('createSequenceSubscription')
				.mockReturnValueOnce('subscribe') // sequenceActionType
				.mockReturnValueOnce('seq_1') // sequenceId
				.mockReturnValueOnce('emailacc_1')
				.mockReturnValueOnce('Rep')
				.mockReturnValueOnce('rep@example.com')
				.mockReturnValueOnce('lead') // contactPreference
				.mockReturnValueOnce('{}') // sQuery
				.mockReturnValueOnce({});

			await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith(
				'POST',
				'/bulk_action/sequence_subscription/',
				{
					action_type: 'subscribe',
					sequence_id: 'seq_1',
					sender_account_id: 'emailacc_1',
					sender_name: 'Rep',
					sender_email: 'rep@example.com',
					contact_preference: 'lead',
					s_query: {},
				},
			);
		});

		it('should run bulk sequence pause without sender fields', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({ id: 'bulksub_2' });

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('bulkAction')
				.mockReturnValueOnce('createSequenceSubscription')
				.mockReturnValueOnce('pause')
				.mockReturnValueOnce('{}') // sQuery
				.mockReturnValueOnce({});

			await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith(
				'POST',
				'/bulk_action/sequence_subscription/',
				{
					action_type: 'pause',
					s_query: {},
				},
			);
		});

		it('should fetch a single bulk email by ID', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({ id: 'bulkemail_1' });

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('bulkAction')
				.mockReturnValueOnce('getEmail')
				.mockReturnValueOnce('bulkemail_1');

			await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith('GET', '/bulk_action/email/bulkemail_1/');
		});

		it('should list bulk edits with limit', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({ data: [], has_more: false });

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('bulkAction')
				.mockReturnValueOnce('listEdit')
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(10);

			await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith('GET', '/bulk_action/edit/', {}, { _limit: 10 });
		});
	});

	describe('Export Operations', () => {
		beforeEach(() => {
			mockExecuteFunctions.getInputData.mockReturnValue([{ json: {} }]);
		});

		it('should create a lead export', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({ id: 'export_1', status: 'created' });

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('export')
				.mockReturnValueOnce('createLead')
				.mockReturnValueOnce('csv') // format
				.mockReturnValueOnce('leads') // leadExportType
				.mockReturnValueOnce('{"type":"and","queries":[]}') // sQuery
				.mockReturnValueOnce({
					dateFormat: 'iso8601',
					fields: 'id, display_name , status_label',
					includeSmartFields: true,
					sendDoneEmail: false,
				});

			await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith('POST', '/export/lead/', {
				format: 'csv',
				type: 'leads',
				s_query: { type: 'and', queries: [] },
				date_format: 'iso8601',
				fields: ['id', 'display_name', 'status_label'],
				include_smart_fields: true,
				send_done_email: false,
			});
		});

		it('should create an opportunity export', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({ id: 'export_2' });

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('export')
				.mockReturnValueOnce('createOpportunity')
				.mockReturnValueOnce('json')
				.mockReturnValueOnce('{"status_type":"won"}')
				.mockReturnValueOnce({ includeAddresses: true, includeCustomObjects: true });

			await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith('POST', '/export/opportunity/', {
				format: 'json',
				params: { status_type: 'won' },
				include_addresses: true,
				include_custom_objects: true,
			});
		});

		it('should fetch a single export', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({
				id: 'export_1',
				status: 'done',
				download_url: 'https://example.com/file.csv',
			});

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('export')
				.mockReturnValueOnce('get')
				.mockReturnValueOnce('export_1');

			await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith('GET', '/export/export_1/');
		});

		it('should list exports', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({ data: [], has_more: false });

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('export')
				.mockReturnValueOnce('find')
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(20);

			await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith('GET', '/export/', {}, { _limit: 20 });
		});
	});

	describe('Field Enrichment Operations', () => {
		beforeEach(() => {
			mockExecuteFunctions.getInputData.mockReturnValue([{ json: {} }]);
		});

		it('should enrich a field on a lead', async () => {
			(closeApiRequest as jest.Mock).mockResolvedValue({});

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('fieldEnrichment')
				.mockReturnValueOnce('enrich')
				.mockReturnValueOnce('orga_1')
				.mockReturnValueOnce('lead')
				.mockReturnValueOnce('lead_1')
				.mockReturnValueOnce('cf_1')
				.mockReturnValueOnce({ setNewValue: true, overwriteExistingValue: true });

			await close.execute.call(mockExecuteFunctions);

			expect(closeApiRequest).toHaveBeenCalledWith('POST', '/enrich_field/', {
				organization_id: 'orga_1',
				object_type: 'lead',
				object_id: 'lead_1',
				field_id: 'cf_1',
				set_new_value: true,
				overwrite_existing_value: true,
			});
		});

		it('should require all enrich field IDs', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('fieldEnrichment')
				.mockReturnValueOnce('enrich')
				.mockReturnValueOnce('') // organizationId missing
				.mockReturnValueOnce('lead')
				.mockReturnValueOnce('lead_1')
				.mockReturnValueOnce('cf_1')
				.mockReturnValueOnce({});

			mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

			await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
				/Organization ID, Object Type, Object ID, and Field ID/,
			);
		});
	});

	describe('Error Handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getInputData.mockReturnValue([{ json: {} }]);
			mockExecuteFunctions.continueOnFail.mockReturnValue(false);
		});

		it('should throw error when resource is missing', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('') // resource (empty)
				.mockReturnValueOnce('find'); // operation

			mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

			await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
				'Resource is required',
			);
		});

		it('should throw error when operation is missing', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('lead') // resource
				.mockReturnValueOnce(''); // operation (empty)

			mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

			await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
				'Operation is required',
			);
		});

		it('should handle API errors gracefully when continueOnFail is true', async () => {
			const apiError = new Error('API Error');

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('lead') // resource
				.mockReturnValueOnce('find') // operation
				.mockReturnValueOnce('test') // query
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce('') // smartViewId
				.mockReturnValueOnce('') // statusId
				.mockReturnValueOnce(10); // limit

			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			(closeApiRequest as jest.Mock).mockRejectedValue(apiError);

			const result = await close.execute.call(mockExecuteFunctions);

			expect(result[0]).toHaveLength(1);
		});
	});
});
