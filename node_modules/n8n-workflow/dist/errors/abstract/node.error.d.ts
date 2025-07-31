import { ExecutionBaseError } from './execution-base.error';
import type { INode, JsonObject } from '../../Interfaces';
export declare abstract class NodeError extends ExecutionBaseError {
    readonly node: INode;
    messages: string[];
    constructor(node: INode, error: Error | JsonObject);
    protected findProperty(jsonError: JsonObject, potentialKeys: string[], traversalKeys?: string[]): string | null;
    protected addToMessages(message: string): void;
    protected setDescriptiveErrorMessage(message: string, messages: string[], code?: string | null, messageMapping?: {
        [key: string]: string;
    }): [string, string[]];
}
