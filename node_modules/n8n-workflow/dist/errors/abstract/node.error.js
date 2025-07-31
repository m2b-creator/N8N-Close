"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeError = void 0;
const execution_base_error_1 = require("./execution-base.error");
const utils_1 = require("../../utils");
const COMMON_ERRORS = {
    ECONNREFUSED: 'The service refused the connection - perhaps it is offline',
    ECONNRESET: 'The connection to the server was closed unexpectedly, perhaps it is offline. You can retry the request immediately or wait and retry later.',
    ENOTFOUND: 'The connection cannot be established, this usually occurs due to an incorrect host (domain) value',
    ETIMEDOUT: "The connection timed out, consider setting the 'Retry on Fail' option in the node settings",
    ERRADDRINUSE: 'The port is already occupied by some other application, if possible change the port or kill the application that is using it',
    EADDRNOTAVAIL: 'The address is not available, ensure that you have the right IP address',
    ECONNABORTED: 'The connection was aborted, perhaps the server is offline',
    EHOSTUNREACH: 'The host is unreachable, perhaps the server is offline',
    EAI_AGAIN: 'The DNS server returned an error, perhaps the server is offline',
    ENOENT: 'The file or directory does not exist',
    EISDIR: 'The file path was expected but the given path is a directory',
    ENOTDIR: 'The directory path was expected but the given path is a file',
    EACCES: 'Forbidden by access permissions, make sure you have the right permissions',
    EEXIST: 'The file or directory already exists',
    EPERM: 'Operation not permitted, make sure you have the right permissions',
    GETADDRINFO: 'The server closed the connection unexpectedly',
};
class NodeError extends execution_base_error_1.ExecutionBaseError {
    constructor(node, error) {
        const isError = error instanceof Error;
        const message = isError ? error.message : '';
        const options = isError ? { cause: error } : { errorResponse: error };
        super(message, options);
        this.node = node;
        this.messages = [];
        if (error instanceof NodeError) {
            this.tags.reWrapped = true;
        }
    }
    findProperty(jsonError, potentialKeys, traversalKeys = []) {
        for (const key of potentialKeys) {
            let value = jsonError[key];
            if (value) {
                if (typeof value === 'string') {
                    try {
                        value = (0, utils_1.jsonParse)(value);
                    }
                    catch (error) {
                        return value;
                    }
                    if (typeof value === 'string')
                        return value;
                }
                if (typeof value === 'number')
                    return value.toString();
                if (Array.isArray(value)) {
                    const resolvedErrors = value
                        .map((jsonError) => {
                        if (typeof jsonError === 'string')
                            return jsonError;
                        if (typeof jsonError === 'number')
                            return jsonError.toString();
                        if ((0, utils_1.isTraversableObject)(jsonError)) {
                            return this.findProperty(jsonError, potentialKeys);
                        }
                        return null;
                    })
                        .filter((errorValue) => errorValue !== null);
                    if (resolvedErrors.length === 0) {
                        return null;
                    }
                    return resolvedErrors.join(' | ');
                }
                if ((0, utils_1.isTraversableObject)(value)) {
                    const property = this.findProperty(value, potentialKeys);
                    if (property) {
                        return property;
                    }
                }
            }
        }
        for (const key of traversalKeys) {
            const value = jsonError[key];
            if ((0, utils_1.isTraversableObject)(value)) {
                const property = this.findProperty(value, potentialKeys, traversalKeys);
                if (property) {
                    return property;
                }
            }
        }
        return null;
    }
    addToMessages(message) {
        if (message && !this.messages.includes(message)) {
            this.messages.push(message);
        }
    }
    setDescriptiveErrorMessage(message, messages, code, messageMapping) {
        let newMessage = message;
        if (messageMapping) {
            for (const [mapKey, mapMessage] of Object.entries(messageMapping)) {
                if ((message || '').toUpperCase().includes(mapKey.toUpperCase())) {
                    newMessage = mapMessage;
                    messages.push(message);
                    break;
                }
            }
            if (newMessage !== message) {
                return [newMessage, messages];
            }
        }
        if (code && typeof code === 'string' && COMMON_ERRORS[code.toUpperCase()]) {
            newMessage = COMMON_ERRORS[code];
            messages.push(message);
            return [newMessage, messages];
        }
        for (const [errorCode, errorDescriptiveMessage] of Object.entries(COMMON_ERRORS)) {
            if ((message || '').toUpperCase().includes(errorCode.toUpperCase())) {
                newMessage = errorDescriptiveMessage;
                messages.push(message);
                break;
            }
        }
        return [newMessage, messages];
    }
}
exports.NodeError = NodeError;
//# sourceMappingURL=node.error.js.map