import { ExecutionBaseError } from './abstract/execution-base.error';
import type { INode } from '../Interfaces';
export declare class WorkflowOperationError extends ExecutionBaseError {
    node: INode | undefined;
    timestamp: number;
    constructor(message: string, node?: INode, description?: string);
}
