import type { BinaryFileType, IDisplayOptions, INodeProperties, JsonObject } from './Interfaces';
export declare const isObjectEmpty: (obj: object | null | undefined) => boolean;
export type Primitives = string | number | boolean | bigint | symbol | null | undefined;
export declare const deepCopy: <T extends ((object | Date) & {
    toJSON?: () => string;
}) | Primitives>(source: T, hash?: WeakMap<object, any>, path?: string) => T;
type MutuallyExclusive<T, U> = (T & {
    [k in Exclude<keyof U, keyof T>]?: never;
}) | (U & {
    [k in Exclude<keyof T, keyof U>]?: never;
});
type JSONParseOptions<T> = {
    acceptJSObject?: boolean;
} & MutuallyExclusive<{
    errorMessage?: string;
}, {
    fallbackValue?: T;
}>;
export declare const jsonParse: <T>(jsonString: string, options?: JSONParseOptions<T>) => T;
type JSONStringifyOptions = {
    replaceCircularRefs?: boolean;
};
export declare const replaceCircularReferences: <T>(value: T, knownObjects?: WeakSet<object>) => T;
export declare const jsonStringify: (obj: unknown, options?: JSONStringifyOptions) => string;
export declare const sleep: (ms: number) => Promise<void>;
export declare function fileTypeFromMimeType(mimeType: string): BinaryFileType | undefined;
export declare function assert<T>(condition: T, msg?: string): asserts condition;
export declare const isTraversableObject: (value: any) => value is JsonObject;
export declare const removeCircularRefs: (obj: JsonObject, seen?: Set<unknown>) => void;
export declare function updateDisplayOptions(displayOptions: IDisplayOptions, properties: INodeProperties[]): {
    displayOptions: IDisplayOptions;
    displayName: string;
    name: string;
    type: import("./Interfaces").NodePropertyTypes;
    typeOptions?: import("./Interfaces").INodePropertyTypeOptions;
    default: import("./Interfaces").NodeParameterValueType;
    description?: string;
    hint?: string;
    disabledOptions?: IDisplayOptions;
    options?: Array<import("./Interfaces").INodePropertyOptions | INodeProperties | import("./Interfaces").INodePropertyCollection>;
    placeholder?: string;
    isNodeSetting?: boolean;
    noDataExpression?: boolean;
    required?: boolean;
    routing?: import("./Interfaces").INodePropertyRouting;
    credentialTypes?: Array<"extends:oAuth2Api" | "extends:oAuth1Api" | "has:authenticate" | "has:genericAuth">;
    extractValue?: import("./Interfaces").INodePropertyValueExtractor;
    modes?: import("./Interfaces").INodePropertyMode[];
    requiresDataPath?: "single" | "multiple";
    doNotInherit?: boolean;
    validateType?: import("./Interfaces").FieldType;
    ignoreValidationDuringExecution?: boolean;
}[];
export declare function randomInt(max: number): number;
export declare function randomInt(min: number, max: number): number;
export declare function randomString(length: number): string;
export declare function randomString(minLength: number, maxLength: number): string;
export declare function hasKey<T extends PropertyKey>(value: unknown, key: T): value is Record<T, unknown>;
export {};
