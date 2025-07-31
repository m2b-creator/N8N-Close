"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeApiRequest = closeApiRequest;
exports.closeApiRequestAllItems = closeApiRequestAllItems;
const n8n_workflow_1 = require("n8n-workflow");
async function closeApiRequest(method, resource, body = {}, qs = {}, option = {}) {
    var _a, _b;
    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
        method,
        qs,
        body,
        uri: `https://api.close.com/api/v1${resource}`,
        json: true,
    };
    if (Object.keys(body).length === 0) {
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
            user: credentials.apiKey,
            pass: '',
        };
        const response = await this.helpers.request(options);
        return response;
    }
    catch (error) {
        if (error.response) {
            const statusCode = error.response.status;
            const errorMessage = ((_a = error.response.data) === null || _a === void 0 ? void 0 : _a.error) || ((_b = error.response.data) === null || _b === void 0 ? void 0 : _b.message) || error.message;
            switch (statusCode) {
                case 401:
                    throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                        message: 'Invalid API key. Please check your Close CRM credentials.',
                        description: 'The API key provided is not valid or has expired.'
                    });
                case 403:
                    throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                        message: 'Access forbidden. Your API key does not have permission for this operation.',
                        description: 'Check that your Close account has the necessary permissions.'
                    });
                case 404:
                    throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                        message: 'Resource not found.',
                        description: 'The requested resource does not exist or may have been deleted.'
                    });
                case 429:
                    throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                        message: 'Rate limit exceeded. Please try again later.',
                        description: 'You have made too many requests. Please wait before trying again.'
                    });
                case 500:
                    throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                        message: 'Close CRM server error. Please try again later.',
                        description: 'There was an internal server error on Close CRM\'s side.'
                    });
                default:
                    throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                        message: `Close CRM API error (${statusCode}): ${errorMessage}`,
                        description: 'An unexpected error occurred while communicating with Close CRM.'
                    });
            }
        }
        throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
    }
}
async function closeApiRequestAllItems(propertyName, method, endpoint, body = {}, query = {}) {
    const returnData = [];
    let responseData;
    query._limit = 100;
    query._skip = 0;
    do {
        responseData = await closeApiRequest.call(this, method, endpoint, body, query);
        query._skip = returnData.length;
        returnData.push.apply(returnData, responseData[propertyName]);
    } while (responseData.has_more !== false);
    return returnData;
}
