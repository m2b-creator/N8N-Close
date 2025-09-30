import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IPollFunctions,
	IHttpRequestMethods,
	IRequestOptions,
	JsonObject,
} from 'n8n-workflow';

import { NodeApiError } from 'n8n-workflow';

export async function closeApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body: any = {},
	qs: IDataObject = {},
	option: IDataObject = {},
): Promise<any> {
	const options: IRequestOptions = {
		headers: {
			'Content-Type': 'application/json',
		},
		method,
		qs,
		body,
		uri: `https://api.close.com/api/v1${resource}`,
		json: true,
	};

	// For PUT/PATCH requests, always send a body (at least empty JSON {})
	// For other methods, delete empty body
	if (Object.keys(body as IDataObject).length === 0 && method !== 'PUT' && method !== 'PATCH') {
		delete options.body;
	}

	if (Object.keys(option).length !== 0) {
		Object.assign(options, option);
	}

	try {
		const credentials = await this.getCredentials('closeApi');
		
		if (!credentials || !credentials.apiKey) {
			throw new Error('Close API credentials are missing or invalid');
		}

		options.auth = {
			user: credentials.apiKey as string,
			pass: '',
		};

		const response = await this.helpers.request(options);
		return response;
	} catch (error: any) {
		if (error.response) {
			const statusCode = error.response.status;
			const errorMessage = error.response.data?.error || error.response.data?.message || error.message;
			
			switch (statusCode) {
				case 401:
					throw new NodeApiError(this.getNode(), { 
						message: 'Invalid API key. Please check your Close CRM credentials.',
						description: 'The API key provided is not valid or has expired.'
					});
				case 403:
					throw new NodeApiError(this.getNode(), { 
						message: 'Access forbidden. Your API key does not have permission for this operation.',
						description: 'Check that your Close account has the necessary permissions.'
					});
				case 404:
					throw new NodeApiError(this.getNode(), { 
						message: 'Resource not found.',
						description: 'The requested resource does not exist or may have been deleted.'
					});
				case 429:
					throw new NodeApiError(this.getNode(), { 
						message: 'Rate limit exceeded. Please try again later.',
						description: 'You have made too many requests. Please wait before trying again.'
					});
				case 500:
					throw new NodeApiError(this.getNode(), { 
						message: 'Close CRM server error. Please try again later.',
						description: 'There was an internal server error on Close CRM\'s side.'
					});
				default:
					throw new NodeApiError(this.getNode(), { 
						message: `Close CRM API error (${statusCode}): ${errorMessage}`,
						description: 'An unexpected error occurred while communicating with Close CRM.'
					});
			}
		}
		
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function closeApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	propertyName: string,
	method: IHttpRequestMethods,
	endpoint: string,
	body: any = {},
	query: IDataObject = {},
): Promise<any> {
	const returnData: IDataObject[] = [];

	let responseData;
	query._limit = 100;
	query._skip = 0;

	do {
		responseData = await closeApiRequest.call(this, method, endpoint, body, query);
		query._skip = returnData.length;
		returnData.push.apply(returnData, responseData[propertyName] as IDataObject[]);
	} while (responseData.has_more !== false);

	return returnData;
}