import { ExecutionBaseError } from './abstract/execution-base.error';
export declare class ExecutionCancelledError extends ExecutionBaseError {
    constructor(executionId: string);
}
