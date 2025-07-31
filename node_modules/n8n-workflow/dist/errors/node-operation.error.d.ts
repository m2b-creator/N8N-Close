import { NodeError } from './abstract/node.error';
import type { NodeOperationErrorOptions } from './node-api.error';
import type { INode, JsonObject } from '../Interfaces';
export declare class NodeOperationError extends NodeError {
    type: string | undefined;
    constructor(node: INode, error: Error | string | JsonObject, options?: NodeOperationErrorOptions);
}
