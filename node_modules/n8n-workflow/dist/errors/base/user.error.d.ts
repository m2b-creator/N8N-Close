import type { BaseErrorOptions } from './base.error';
import { BaseError } from './base.error';
export type UserErrorOptions = Omit<BaseErrorOptions, 'level'> & {
    level?: 'info' | 'warning';
    description?: string | null | undefined;
};
export declare class UserError extends BaseError {
    readonly description: string | null | undefined;
    constructor(message: string, opts?: UserErrorOptions);
}
