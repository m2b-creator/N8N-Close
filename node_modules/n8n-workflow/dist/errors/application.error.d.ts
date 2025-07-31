import type { Event } from '@sentry/node';
import type { ErrorLevel, ReportingOptions } from '@/errors/error.types';
export declare class ApplicationError extends Error {
    level: ErrorLevel;
    readonly tags: NonNullable<Event['tags']>;
    readonly extra?: Event['extra'];
    readonly packageName?: string;
    constructor(message: string, { level, tags, extra, ...rest }?: Partial<ErrorOptions> & ReportingOptions);
}
