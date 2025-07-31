import { WorkflowOperationError } from './workflow-operation.error';
export declare class SubworkflowOperationError extends WorkflowOperationError {
    description: string;
    cause: Error;
    constructor(message: string, description: string);
}
