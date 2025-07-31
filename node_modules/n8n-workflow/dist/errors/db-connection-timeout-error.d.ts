import { ApplicationError } from './application.error';
export type DbConnectionTimeoutErrorOpts = {
    configuredTimeoutInMs: number;
    cause: Error;
};
export declare class DbConnectionTimeoutError extends ApplicationError {
    constructor(opts: DbConnectionTimeoutErrorOpts);
}
