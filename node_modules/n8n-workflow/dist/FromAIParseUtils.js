"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateZodSchema = generateZodSchema;
exports.extractFromAICalls = extractFromAICalls;
exports.traverseNodeParameters = traverseNodeParameters;
const zod_1 = require("zod");
const utils_1 = require("./utils");
class ParseError extends Error {
}
function generateZodSchema(placeholder) {
    let schema;
    switch (placeholder.type?.toLowerCase()) {
        case 'string':
            schema = zod_1.z.string();
            break;
        case 'number':
            schema = zod_1.z.number();
            break;
        case 'boolean':
            schema = zod_1.z.boolean();
            break;
        case 'json': {
            const customSchema = zod_1.z.custom((data) => {
                if (data === null || typeof data !== 'object')
                    return false;
                if (Array.isArray(data)) {
                    return data.length > 0;
                }
                return Object.keys(data).length > 0;
            }, {
                message: 'Value must be a non-empty object or a non-empty array',
            });
            const typedSchema = customSchema;
            typedSchema._def.jsonSchema = {
                anyOf: [
                    {
                        type: 'object',
                        minProperties: 1,
                        additionalProperties: true,
                    },
                    {
                        type: 'array',
                        minItems: 1,
                    },
                ],
            };
            schema = typedSchema;
            break;
        }
        default:
            schema = zod_1.z.string();
    }
    if (placeholder.description) {
        schema = schema.describe(`${schema.description ?? ''} ${placeholder.description}`.trim());
    }
    if (placeholder.defaultValue !== undefined) {
        schema = schema.default(placeholder.defaultValue);
    }
    return schema;
}
function parseDefaultValue(value) {
    if (value === undefined || value === '')
        return undefined;
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true')
        return true;
    if (lowerValue === 'false')
        return false;
    if (!isNaN(Number(value)))
        return Number(value);
    try {
        return (0, utils_1.jsonParse)(value);
    }
    catch {
        return value;
    }
}
function parseArguments(argsString) {
    const args = [];
    let currentArg = '';
    let inQuotes = false;
    let quoteChar = '';
    let escapeNext = false;
    for (let i = 0; i < argsString.length; i++) {
        const char = argsString[i];
        if (escapeNext) {
            currentArg += char;
            escapeNext = false;
            continue;
        }
        if (char === '\\') {
            escapeNext = true;
            continue;
        }
        if (['"', "'", '`'].includes(char)) {
            if (!inQuotes) {
                inQuotes = true;
                quoteChar = char;
                currentArg += char;
            }
            else if (char === quoteChar) {
                inQuotes = false;
                quoteChar = '';
                currentArg += char;
            }
            else {
                currentArg += char;
            }
            continue;
        }
        if (char === ',' && !inQuotes) {
            args.push(currentArg.trim());
            currentArg = '';
            continue;
        }
        currentArg += char;
    }
    if (currentArg) {
        args.push(currentArg.trim());
    }
    const cleanArgs = args.map((arg) => {
        const trimmed = arg.trim();
        if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
            (trimmed.startsWith('`') && trimmed.endsWith('`')) ||
            (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
            return trimmed
                .slice(1, -1)
                .replace(/\\'/g, "'")
                .replace(/\\`/g, '`')
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\');
        }
        return trimmed;
    });
    const type = cleanArgs?.[2] || 'string';
    if (!['string', 'number', 'boolean', 'json'].includes(type.toLowerCase())) {
        throw new ParseError(`Invalid type: ${type}`);
    }
    return {
        key: cleanArgs[0] || '',
        description: cleanArgs[1],
        type: (cleanArgs?.[2] ?? 'string'),
        defaultValue: parseDefaultValue(cleanArgs[3]),
    };
}
function extractFromAICalls(str) {
    const args = [];
    const pattern = /\$fromAI\s*\(\s*/gi;
    let match;
    while ((match = pattern.exec(str)) !== null) {
        const startIndex = match.index + match[0].length;
        let current = startIndex;
        let inQuotes = false;
        let quoteChar = '';
        let parenthesesCount = 1;
        let argsString = '';
        while (current < str.length && parenthesesCount > 0) {
            const char = str[current];
            if (inQuotes) {
                if (char === '\\' && current + 1 < str.length) {
                    argsString += char + str[current + 1];
                    current += 2;
                    continue;
                }
                if (char === quoteChar) {
                    inQuotes = false;
                    quoteChar = '';
                }
                argsString += char;
            }
            else {
                if (['"', "'", '`'].includes(char)) {
                    inQuotes = true;
                    quoteChar = char;
                }
                else if (char === '(') {
                    parenthesesCount++;
                }
                else if (char === ')') {
                    parenthesesCount--;
                }
                if (parenthesesCount > 0 || char !== ')') {
                    argsString += char;
                }
            }
            current++;
        }
        if (parenthesesCount === 0) {
            try {
                const parsedArgs = parseArguments(argsString);
                args.push(parsedArgs);
            }
            catch (error) {
                throw new ParseError(`Failed to parse $fromAI arguments: ${argsString}: ${String(error)}`);
            }
        }
        else {
            throw new ParseError(`Unbalanced parentheses while parsing $fromAI call: ${str.slice(startIndex)}`);
        }
    }
    return args;
}
function traverseNodeParameters(payload, collectedArgs) {
    if (typeof payload === 'string') {
        const fromAICalls = extractFromAICalls(payload);
        fromAICalls.forEach((call) => collectedArgs.push(call));
    }
    else if (Array.isArray(payload)) {
        payload.forEach((item) => traverseNodeParameters(item, collectedArgs));
    }
    else if (typeof payload === 'object' && payload !== null) {
        Object.values(payload).forEach((value) => traverseNodeParameters(value, collectedArgs));
    }
}
//# sourceMappingURL=FromAIParseUtils.js.map