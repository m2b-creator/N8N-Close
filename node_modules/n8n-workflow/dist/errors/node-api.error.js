"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeApiError = void 0;
const axios_1 = require("axios");
const xml2js_1 = require("xml2js");
const node_error_1 = require("./abstract/node.error");
const Constants_1 = require("../Constants");
const utils_1 = require("../utils");
const POSSIBLE_ERROR_MESSAGE_KEYS = [
    'cause',
    'error',
    'message',
    'Message',
    'msg',
    'messages',
    'description',
    'reason',
    'detail',
    'details',
    'errors',
    'errorMessage',
    'errorMessages',
    'ErrorMessage',
    'error_message',
    '_error_message',
    'errorDescription',
    'error_description',
    'error_summary',
    'error_info',
    'title',
    'text',
    'field',
    'err',
    'type',
];
const POSSIBLE_NESTED_ERROR_OBJECT_KEYS = ['Error', 'error', 'err', 'response', 'body', 'data'];
const POSSIBLE_ERROR_STATUS_KEYS = [
    'statusCode',
    'status',
    'code',
    'status_code',
    'errorCode',
    'error_code',
];
const STATUS_CODE_MESSAGES = {
    '4XX': 'Your request is invalid or could not be processed by the service',
    '400': 'Bad request - please check your parameters',
    '401': 'Authorization failed - please check your credentials',
    '402': 'Payment required - perhaps check your payment details?',
    '403': 'Forbidden - perhaps check your credentials?',
    '404': 'The resource you are requesting could not be found',
    '405': 'Method not allowed - please check you are using the right HTTP method',
    '429': 'The service is receiving too many requests from you',
    '5XX': 'The service failed to process your request',
    '500': 'The service was not able to process your request',
    '502': 'Bad gateway - the service failed to handle your request',
    '503': 'Service unavailable - try again later or consider setting this node to retry automatically (in the node settings)',
    '504': 'Gateway timed out - perhaps try again later?',
};
class NodeApiError extends node_error_1.NodeError {
    constructor(node, errorResponse, { message, description, httpCode, parseXml, runIndex, itemIndex, level, functionality, messageMapping, } = {}) {
        if (errorResponse instanceof NodeApiError) {
            return errorResponse;
        }
        super(node, errorResponse);
        this.httpCode = null;
        this.addToMessages(errorResponse.message);
        if (!httpCode && errorResponse instanceof axios_1.AxiosError) {
            httpCode = errorResponse.response?.status?.toString();
        }
        if (errorResponse.error) {
            (0, utils_1.removeCircularRefs)(errorResponse.error);
        }
        if (!description &&
            (errorResponse.description || errorResponse?.reason?.description)) {
            this.description = (errorResponse.description ||
                errorResponse?.reason?.description);
        }
        if (!message &&
            (errorResponse.message || errorResponse?.reason?.message || description)) {
            this.message = (errorResponse.message ||
                errorResponse?.reason?.message ||
                description);
        }
        if (errorResponse.reason) {
            const reason = errorResponse.reason;
            if (reason.isAxiosError && reason.response) {
                errorResponse = reason.response;
            }
        }
        if (httpCode) {
            this.httpCode = httpCode;
        }
        else if (errorResponse.httpCode) {
            this.httpCode = errorResponse.httpCode;
        }
        else {
            this.httpCode =
                this.findProperty(errorResponse, POSSIBLE_ERROR_STATUS_KEYS, POSSIBLE_NESTED_ERROR_OBJECT_KEYS) ?? null;
        }
        this.level = level ?? 'warning';
        if (errorResponse?.response &&
            typeof errorResponse?.response === 'object' &&
            !Array.isArray(errorResponse.response) &&
            errorResponse.response.data &&
            typeof errorResponse.response.data === 'object' &&
            !Array.isArray(errorResponse.response.data)) {
            const data = errorResponse.response.data;
            if (data.message) {
                description = data.message;
            }
            else if (data.error && (data.error || {}).message) {
                description = data.error.message;
            }
            this.context.data = data;
        }
        if (description) {
            this.description = description;
        }
        if (!this.description) {
            if (parseXml) {
                this.setDescriptionFromXml(errorResponse.error);
            }
            else {
                this.description = this.findProperty(errorResponse, POSSIBLE_ERROR_MESSAGE_KEYS, POSSIBLE_NESTED_ERROR_OBJECT_KEYS);
            }
        }
        if (message) {
            this.message = message;
        }
        else {
            this.setDefaultStatusCodeMessage();
        }
        if (this.message === this.description) {
            this.description = undefined;
        }
        [this.message, this.messages] = this.setDescriptiveErrorMessage(this.message, this.messages, this.httpCode ||
            errorResponse?.code ||
            errorResponse?.reason?.code ||
            undefined, messageMapping);
        if (functionality !== undefined)
            this.functionality = functionality;
        if (runIndex !== undefined)
            this.context.runIndex = runIndex;
        if (itemIndex !== undefined)
            this.context.itemIndex = itemIndex;
    }
    setDescriptionFromXml(xml) {
        (0, xml2js_1.parseString)(xml, { explicitArray: false }, (_, result) => {
            if (!result)
                return;
            const topLevelKey = Object.keys(result)[0];
            this.description = this.findProperty(result[topLevelKey], POSSIBLE_ERROR_MESSAGE_KEYS, POSSIBLE_NESTED_ERROR_OBJECT_KEYS);
        });
    }
    setDefaultStatusCodeMessage() {
        if (!this.httpCode && this.message && this.message.toLowerCase().includes('bad gateway')) {
            this.httpCode = '502';
        }
        if (!this.httpCode) {
            this.httpCode = null;
            if (!this.message) {
                if (this.description) {
                    this.message = this.description;
                    this.description = undefined;
                }
                else {
                    this.message = Constants_1.UNKNOWN_ERROR_MESSAGE;
                    this.description = Constants_1.UNKNOWN_ERROR_DESCRIPTION;
                }
            }
            return;
        }
        if (STATUS_CODE_MESSAGES[this.httpCode]) {
            this.addToMessages(this.message);
            this.message = STATUS_CODE_MESSAGES[this.httpCode];
            return;
        }
        switch (this.httpCode.charAt(0)) {
            case '4':
                this.addToMessages(this.message);
                this.message = STATUS_CODE_MESSAGES['4XX'];
                break;
            case '5':
                this.addToMessages(this.message);
                this.message = STATUS_CODE_MESSAGES['5XX'];
                break;
            default:
                if (!this.message) {
                    if (this.description) {
                        this.message = this.description;
                        this.description = undefined;
                    }
                    else {
                        this.message = Constants_1.UNKNOWN_ERROR_MESSAGE;
                        this.description = Constants_1.UNKNOWN_ERROR_DESCRIPTION;
                    }
                }
        }
        if (this.node.type === Constants_1.NO_OP_NODE_TYPE && this.message === Constants_1.UNKNOWN_ERROR_MESSAGE) {
            this.message = `${Constants_1.UNKNOWN_ERROR_MESSAGE_CRED} - ${this.httpCode}`;
        }
    }
}
exports.NodeApiError = NodeApiError;
//# sourceMappingURL=node-api.error.js.map