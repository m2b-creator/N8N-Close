import type { BaseErrorOptions } from './base.error';
import { BaseError } from './base.error';
export type OperationalErrorOptions = Omit<BaseErrorOptions, 'level'> & {
    level?: 'info' | 'warning' | 'error';
};
export declare class OperationalError extends BaseError {
    constructor(message: string, opts?: OperationalErrorOptions);
}
