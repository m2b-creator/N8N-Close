"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionBaseError = void 0;
const application_error_1 = require("../application.error");
class ExecutionBaseError extends application_error_1.ApplicationError {
    constructor(message, options = {}) {
        super(message, options);
        this.context = {};
        this.functionality = 'regular';
        this.name = this.constructor.name;
        this.timestamp = Date.now();
        const { cause, errorResponse } = options;
        if (cause instanceof ExecutionBaseError) {
            this.context = cause.context;
        }
        else if (cause && !(cause instanceof Error)) {
            this.cause = cause;
        }
        if (errorResponse)
            this.errorResponse = errorResponse;
    }
    toJSON() {
        return {
            message: this.message,
            lineNumber: this.lineNumber,
            timestamp: this.timestamp,
            name: this.name,
            description: this.description,
            context: this.context,
            cause: this.cause,
        };
    }
}
exports.ExecutionBaseError = ExecutionBaseError;
//# sourceMappingURL=execution-base.error.js.map