import type { BaseErrorOptions } from './base.error';
import { BaseError } from './base.error';
export type UnexpectedErrorOptions = Omit<BaseErrorOptions, 'level'> & {
    level?: 'error' | 'fatal';
};
export declare class UnexpectedError extends BaseError {
    constructor(message: string, opts?: UnexpectedErrorOptions);
}
