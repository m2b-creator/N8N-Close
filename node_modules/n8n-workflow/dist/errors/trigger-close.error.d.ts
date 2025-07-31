import { ApplicationError } from './application.error';
import type { ErrorLevel } from './error.types';
import type { INode } from '../Interfaces';
interface TriggerCloseErrorOptions extends ErrorOptions {
    level: ErrorLevel;
}
export declare class TriggerCloseError extends ApplicationError {
    readonly node: INode;
    constructor(node: INode, { cause, level }: TriggerCloseErrorOptions);
}
export {};
