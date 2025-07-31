import { Close } from '../Close.node';

describe('Close', () => {
	let close: Close;

	beforeEach(() => {
		close = new Close();
	});

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
});