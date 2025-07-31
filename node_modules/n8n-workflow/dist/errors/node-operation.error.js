"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeOperationError = void 0;
const node_error_1 = require("./abstract/node.error");
const application_error_1 = require("./application.error");
class NodeOperationError extends node_error_1.NodeError {
    constructor(node, error, options = {}) {
        if (error instanceof NodeOperationError) {
            return error;
        }
        if (typeof error === 'string') {
            error = new application_error_1.ApplicationError(error, { level: options.level ?? 'warning' });
        }
        super(node, error);
        if (error instanceof node_error_1.NodeError && error?.messages?.length) {
            error.messages.forEach((message) => this.addToMessages(message));
        }
        if (options.message)
            this.message = options.message;
        this.level = options.level ?? 'warning';
        if (options.functionality)
            this.functionality = options.functionality;
        if (options.type)
            this.type = options.type;
        this.description = options.description;
        this.context.runIndex = options.runIndex;
        this.context.itemIndex = options.itemIndex;
        this.context.metadata = options.metadata;
        if (this.message === this.description) {
            this.description = undefined;
        }
        [this.message, this.messages] = this.setDescriptiveErrorMessage(this.message, this.messages, undefined, options.messageMapping);
    }
}
exports.NodeOperationError = NodeOperationError;
//# sourceMappingURL=node-operation.error.js.map