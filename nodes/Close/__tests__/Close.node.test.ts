import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Close } from '../Close.node';

// Mock the GenericFunctions module
jest.mock('../GenericFunctions', () => ({
	closeApiRequest: jest.fn(),
	closeApiRequestAllItems: jest.fn(),
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
				returnJsonArray: jest.fn().mockImplementation((data: any) => Array.isArray(data) ? data : [data]),
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
			expect(close.methods?.loadOptions?.getCustomFields).toBeDefined();
			expect(close.methods?.loadOptions?.getSmartViews).toBeDefined();
		});

		it('should have resource options', () => {
			const resourceProperty = close.description.properties.find(prop => prop.name === 'resource');
			expect(resourceProperty).toBeDefined();
			expect(resourceProperty?.type).toBe('options');
			expect(resourceProperty?.options).toHaveLength(6);
		});

		it('should have all lead operations', () => {
			const operationProperty = close.description.properties.find(
				prop => prop.name === 'operation' && prop.displayOptions?.show?.resource?.includes('lead')
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
					'Lead name is required for create operation'
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
					'Lead ID is required for delete operation'
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
					'Source Lead ID is required for merge operation'
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
					'Destination Lead ID is required for merge operation'
				);
			});
		});

		describe('Find Leads', () => {
			it('should find leads with query parameter', async () => {
				const mockResponse = {
					data: [
						{ id: 'lead_1', name: 'Company 1' },
						{ id: 'lead_2', name: 'Company 2' },
					],
				};

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('lead') // resource
					.mockReturnValueOnce('find') // operation
					.mockReturnValueOnce('test query') // query
					.mockReturnValueOnce(false) // returnAll
					.mockReturnValueOnce('') // smartViewId
					.mockReturnValueOnce('') // statusId
					.mockReturnValueOnce(10); // limit

				(closeApiRequest as jest.Mock).mockResolvedValue(mockResponse);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequest).toHaveBeenCalledWith(
					'GET',
					'/lead/',
					{},
					{ query: 'test query', _limit: 10 }
				);
			});

			it('should find all leads when returnAll is true', async () => {
				const mockLeads = [
					{ id: 'lead_1', name: 'Company 1' },
					{ id: 'lead_2', name: 'Company 2' },
				];

				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('lead') // resource
					.mockReturnValueOnce('find') // operation
					.mockReturnValueOnce('') // query
					.mockReturnValueOnce(true) // returnAll
					.mockReturnValueOnce('') // smartViewId
					.mockReturnValueOnce(''); // statusId

				(closeApiRequestAllItems as jest.Mock).mockResolvedValue(mockLeads);

				await close.execute.call(mockExecuteFunctions);

				expect(closeApiRequestAllItems).toHaveBeenCalledWith(
					'data',
					'GET',
					'/lead/',
					{},
					{}
				);
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
					.mockReturnValueOnce({}); // customFieldsUi

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
					'Lead ID is required for update operation'
				);
			});
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
				'Resource is required'
			);
		});

		it('should throw error when operation is missing', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('lead') // resource
				.mockReturnValueOnce(''); // operation (empty)

			mockExecuteFunctions.getNode.mockReturnValue({ name: 'Close CRM' } as any);

			await expect(close.execute.call(mockExecuteFunctions)).rejects.toThrow(
				'Operation is required'
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