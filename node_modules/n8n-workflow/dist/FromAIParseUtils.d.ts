import { z } from 'zod';
export type FromAIArgumentType = 'string' | 'number' | 'boolean' | 'json';
export type FromAIArgument = {
    key: string;
    description?: string;
    type?: FromAIArgumentType;
    defaultValue?: string | number | boolean | Record<string, unknown>;
};
export declare function generateZodSchema(placeholder: FromAIArgument): z.ZodTypeAny;
export declare function extractFromAICalls(str: string): FromAIArgument[];
export declare function traverseNodeParameters(payload: unknown, collectedArgs: FromAIArgument[]): void;
