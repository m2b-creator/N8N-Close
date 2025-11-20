import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IPollFunctions,
	JsonObject,
	NodeOperationError,
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
	const options: IHttpRequestOptions = {
		headers: {
			'Content-Type': 'application/json',
		},
		method,
		qs,
		body,
		url: `https://api.close.com/api/v1${resource}`,
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

	const credentials = await this.getCredentials('closeApi');

	if (!credentials || !credentials.apiKey) {
		throw new NodeOperationError(this.getNode(),'Close API credentials are missing or invalid');
	}

	options.auth = {
		username: credentials.apiKey as string,
		password: '',
	};

	try {
		return await this.helpers.httpRequest(options);
	} catch (error: any) {
		if (error.response) {
			const statusCode = error.response.status;
			const errorMessage = error.response.data?.error || error.response.data?.message || error.message;
			const errorDetails = error.response.data?.errors || error.response.data;

			switch (statusCode) {
				case 400:
					throw new NodeApiError(this.getNode(), {
						message: `Bad Request: ${errorMessage}`,
						description: `The request was invalid. Details: ${JSON.stringify(errorDetails, null, 2)}\n\nRequest: ${method} ${resource}\nBody: ${JSON.stringify(body, null, 2)}`
					});
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

/**
 * Convert plain text with newlines to proper HTML format required by Close CRM
 * Close CRM expects rich text fields to have proper HTML structure with <p> tags
 */
/**
 * Convert plain text with newlines to proper HTML format required by Close CRM
 * Close CRM expects rich text fields to have proper HTML structure with <p> tags
 */
export function convertPlainTextToHTML(text: string): string {
	// If the text is already HTML with body tags, return as-is
	if (text.includes('<body>') || text.includes('<body ')) {
		return text;
	}

	// Split by lines first to analyze the structure
	const lines = text.split('\n');
	const result: string[] = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];
		const trimmed = line.trim();

		// Skip empty lines
		if (!trimmed) {
			i++;
			continue;
		}

		// Check if this line starts a list
		if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
			// Collect consecutive list items
			const listItems: string[] = [];
			while (i < lines.length) {
				const currentLine = lines[i].trim();
				if (!currentLine) {
					i++;
					break; // Empty line ends the list
				}
				if (currentLine.startsWith('-') || currentLine.startsWith('*')) {
					// Remove the leading - or * and any whitespace
					const content = currentLine.replace(/^[-*]\s*/, '');
					listItems.push(`<li>${content}</li>`);
					i++;
				} else {
					// Non-list line ends the list
					break;
				}
			}
			if (listItems.length > 0) {
				result.push(`<ul>${listItems.join('')}</ul>`);
			}
		} else {
			// Regular paragraph - collect lines until empty line or list
			const paragraphLines: string[] = [trimmed];
			i++;
			
			while (i < lines.length) {
				const nextLine = lines[i];
				const nextTrimmed = nextLine.trim();
				
				// Empty line ends paragraph
				if (!nextTrimmed) {
					i++;
					break;
				}
				
				// List item ends paragraph
				if (nextTrimmed.startsWith('-') || nextTrimmed.startsWith('*')) {
					break;
				}
				
				paragraphLines.push(nextTrimmed);
				i++;
			}
			
			result.push(`<p>${paragraphLines.join('<br>')}</p>`);
		}
	}

	// Wrap in body tags
	return `<body>${result.join('')}</body>`;
}

