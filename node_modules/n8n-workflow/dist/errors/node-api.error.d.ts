import { NodeError } from './abstract/node.error';
import type { ErrorLevel } from './error.types';
import type { INode, JsonObject, Functionality, RelatedExecution } from '../Interfaces';
export interface NodeOperationErrorOptions {
    message?: string;
    description?: string;
    runIndex?: number;
    itemIndex?: number;
    level?: ErrorLevel;
    messageMapping?: {
        [key: string]: string;
    };
    functionality?: Functionality;
    type?: string;
    metadata?: {
        subExecution?: RelatedExecution;
        parentExecution?: RelatedExecution;
    };
}
interface NodeApiErrorOptions extends NodeOperationErrorOptions {
    message?: string;
    httpCode?: string;
    parseXml?: boolean;
}
export declare class NodeApiError extends NodeError {
    httpCode: string | null;
    constructor(node: INode, errorResponse: JsonObject, { message, description, httpCode, parseXml, runIndex, itemIndex, level, functionality, messageMapping, }?: NodeApiErrorOptions);
    private setDescriptionFromXml;
    private setDefaultStatusCodeMessage;
}
export {};
