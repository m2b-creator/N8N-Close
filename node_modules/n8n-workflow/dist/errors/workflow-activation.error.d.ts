import { ExecutionBaseError } from './abstract/execution-base.error';
import type { ApplicationError } from './application.error';
import type { INode } from '../Interfaces';
interface WorkflowActivationErrorOptions {
    cause?: Error;
    node?: INode;
    level?: ApplicationError['level'];
    workflowId?: string;
}
export declare class WorkflowActivationError extends ExecutionBaseError {
    node: INode | undefined;
    workflowId: string | undefined;
    constructor(message: string, { cause, node, level, workflowId }?: WorkflowActivationErrorOptions);
    private setLevel;
}
export {};
