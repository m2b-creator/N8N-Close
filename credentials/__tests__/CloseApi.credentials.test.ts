import { CloseApi } from '../CloseApi.credentials';

describe('CloseApi', () => {
	let closeApi: CloseApi;

	beforeEach(() => {
		closeApi = new CloseApi();
	});

	it('should be defined', () => {
		expect(closeApi).toBeDefined();
	});

	it('should have the correct name', () => {
		expect(closeApi.name).toBe('closeApi');
	});

	it('should have the correct display name', () => {
		expect(closeApi.displayName).toBe('Close API');
	});

	it('should have API key property', () => {
		expect(closeApi.properties).toHaveLength(1);
		expect(closeApi.properties[0].name).toBe('apiKey');
		expect(closeApi.properties[0].type).toBe('string');
		expect(closeApi.properties[0].required).toBe(true);
	});

	it('should have authentication configuration', () => {
		expect(closeApi.authenticate).toBeDefined();
		expect(closeApi.authenticate.type).toBe('generic');
	});

	it('should have test configuration', () => {
		expect(closeApi.test).toBeDefined();
		expect(closeApi.test.request.baseURL).toBe('https://api.close.com/api/v1');
		expect(closeApi.test.request.url).toBe('/me/');
	});
});