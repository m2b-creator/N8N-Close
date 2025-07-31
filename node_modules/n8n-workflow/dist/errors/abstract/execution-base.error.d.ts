import type { Functionality, IDataObject, JsonObject } from '../../Interfaces';
import { ApplicationError } from '../application.error';
import type { ReportingOptions } from '../error.types';
interface ExecutionBaseErrorOptions extends ReportingOptions {
    cause?: Error;
    errorResponse?: JsonObject;
}
export declare abstract class ExecutionBaseError extends ApplicationError {
    description: string | null | undefined;
    cause?: Error;
    errorResponse?: JsonObject;
    timestamp: number;
    context: IDataObject;
    lineNumber: number | undefined;
    functionality: Functionality;
    constructor(message: string, options?: ExecutionBaseErrorOptions);
    toJSON?(): {
        message: string;
        lineNumber: number | undefined;
        timestamp: number;
        name: string;
        description: string | null | undefined;
        context: IDataObject;
        cause: Error | undefined;
    };
}
export {};
