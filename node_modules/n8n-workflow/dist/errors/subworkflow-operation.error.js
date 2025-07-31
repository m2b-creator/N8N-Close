"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubworkflowOperationError = void 0;
const workflow_operation_error_1 = require("./workflow-operation.error");
class SubworkflowOperationError extends workflow_operation_error_1.WorkflowOperationError {
    constructor(message, description) {
        super(message);
        this.description = '';
        this.name = this.constructor.name;
        this.description = description;
        this.cause = {
            name: this.name,
            message,
            stack: this.stack,
        };
    }
}
exports.SubworkflowOperationError = SubworkflowOperationError;
//# sourceMappingURL=subworkflow-operation.error.js.map