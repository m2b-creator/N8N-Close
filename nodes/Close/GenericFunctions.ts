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
import { toHTML } from '@portabletext/to-html';

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
 * Convert plain text with newlines and HTML formatting to Portable Text format and then to HTML
 */
export function convertPlainTextToHTML(text: string): string {
	// Split text by newlines to create blocks
	const lines = text.split('\n');

	// Convert each line to a Portable Text block
	const blocks = lines.map(line => ({
		_type: 'block',
		_key: Math.random().toString(36).substring(7), // Generate random key
		style: 'normal',
		children: parseHTMLToSpans(line)
	}));

	// Convert Portable Text to HTML
	const html = toHTML(blocks);

	// Wrap in body tags and return
	return `<body>${html}</body>`;
}

/**
 * Parse HTML tags within text and convert to Portable Text spans with marks
 */
function parseHTMLToSpans(text: string): Array<{ _type: string; text: string; marks: string[] }> {
	const spans: Array<{ _type: string; text: string; marks: string[] }> = [];

	// Map of HTML tags to Portable Text marks
	const tagToMark: { [key: string]: string } = {
		'b': 'strong',
		'strong': 'strong',
		'i': 'em',
		'em': 'em',
		'u': 'underline',
		'strike': 'strike-through',
		's': 'strike-through',
		'code': 'code'
	};

	// Regular expression to match HTML tags
	const htmlTagRegex = /<(\/)?(b|strong|i|em|u|strike|s|code)>/gi;

	let lastIndex = 0;
	let currentMarks: string[] = [];
	const markStack: string[] = [];

	// Replace matches
	let match;
	while ((match = htmlTagRegex.exec(text)) !== null) {
		const isClosing = match[1] === '/';
		const tagName = match[2].toLowerCase();
		const mark = tagToMark[tagName];

		// Add text before this tag
		if (match.index > lastIndex) {
			const textContent = text.substring(lastIndex, match.index);
			if (textContent) {
				spans.push({
					_type: 'span',
					text: textContent,
					marks: [...currentMarks]
				});
			}
		}

		// Update marks
		if (isClosing) {
			// Remove the mark
			const index = currentMarks.indexOf(mark);
			if (index > -1) {
				currentMarks.splice(index, 1);
				markStack.pop();
			}
		} else {
			// Add the mark
			currentMarks.push(mark);
			markStack.push(mark);
		}

		lastIndex = match.index + match[0].length;
	}

	// Add remaining text
	if (lastIndex < text.length) {
		const textContent = text.substring(lastIndex);
		if (textContent) {
			spans.push({
				_type: 'span',
				text: textContent,
				marks: [...currentMarks]
			});
		}
	}

	// If no HTML tags were found, return single span with plain text
	if (spans.length === 0 && text.trim()) {
		spans.push({
			_type: 'span',
			text: text.trim(),
			marks: []
		});
	}

	return spans;
}