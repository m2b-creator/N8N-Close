import type { Event } from '@sentry/node';
import type { ErrorTags, ErrorLevel, ReportingOptions } from '../error.types';
export type BaseErrorOptions = {
    description?: undefined | null;
} & ErrorOptions & ReportingOptions;
export declare abstract class BaseError extends Error {
    level: ErrorLevel;
    readonly shouldReport: boolean;
    readonly description: string | null | undefined;
    readonly tags: ErrorTags;
    readonly extra?: Event['extra'];
    readonly packageName?: string;
    constructor(message: string, { level, description, shouldReport, tags, extra, ...rest }?: BaseErrorOptions);
}
