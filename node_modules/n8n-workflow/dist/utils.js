"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCircularRefs = exports.isTraversableObject = exports.sleep = exports.jsonStringify = exports.replaceCircularReferences = exports.jsonParse = exports.deepCopy = exports.isObjectEmpty = void 0;
exports.fileTypeFromMimeType = fileTypeFromMimeType;
exports.assert = assert;
exports.updateDisplayOptions = updateDisplayOptions;
exports.randomInt = randomInt;
exports.randomString = randomString;
exports.hasKey = hasKey;
const esprima_next_1 = require("esprima-next");
const form_data_1 = __importDefault(require("form-data"));
const lodash_1 = require("lodash");
const Constants_1 = require("./Constants");
const application_error_1 = require("./errors/application.error");
const readStreamClasses = new Set(['ReadStream', 'Readable', 'ReadableStream']);
BigInt.prototype.toJSON = function () {
    return this.toString();
};
const isObjectEmpty = (obj) => {
    if (obj === undefined || obj === null)
        return true;
    if (typeof obj === 'object') {
        if (obj instanceof form_data_1.default)
            return obj.getLengthSync() === 0;
        if (Array.isArray(obj))
            return obj.length === 0;
        if (obj instanceof Set || obj instanceof Map)
            return obj.size === 0;
        if (ArrayBuffer.isView(obj) || obj instanceof ArrayBuffer)
            return obj.byteLength === 0;
        if (Symbol.iterator in obj || readStreamClasses.has(obj.constructor.name))
            return false;
        return Object.keys(obj).length === 0;
    }
    return true;
};
exports.isObjectEmpty = isObjectEmpty;
const deepCopy = (source, hash = new WeakMap(), path = '') => {
    const hasOwnProp = Object.prototype.hasOwnProperty.bind(source);
    if (typeof source !== 'object' || source === null || typeof source === 'function') {
        return source;
    }
    if (typeof source.toJSON === 'function') {
        return source.toJSON();
    }
    if (hash.has(source)) {
        return hash.get(source);
    }
    if (Array.isArray(source)) {
        const clone = [];
        const len = source.length;
        for (let i = 0; i < len; i++) {
            clone[i] = (0, exports.deepCopy)(source[i], hash, path + `[${i}]`);
        }
        return clone;
    }
    const clone = Object.create(Object.getPrototypeOf({}));
    hash.set(source, clone);
    for (const i in source) {
        if (hasOwnProp(i)) {
            clone[i] = (0, exports.deepCopy)(source[i], hash, path + `.${i}`);
        }
    }
    return clone;
};
exports.deepCopy = deepCopy;
function syntaxNodeToValue(expression) {
    switch (expression?.type) {
        case esprima_next_1.Syntax.ObjectExpression:
            return Object.fromEntries(expression.properties
                .filter((prop) => prop.type === esprima_next_1.Syntax.Property)
                .map(({ key, value }) => [syntaxNodeToValue(key), syntaxNodeToValue(value)]));
        case esprima_next_1.Syntax.Identifier:
            return expression.name;
        case esprima_next_1.Syntax.Literal:
            return expression.value;
        case esprima_next_1.Syntax.ArrayExpression:
            return expression.elements.map((exp) => syntaxNodeToValue(exp));
        default:
            return undefined;
    }
}
function parseJSObject(objectAsString) {
    const jsExpression = (0, esprima_next_1.parse)(`(${objectAsString})`).body.find((node) => node.type === esprima_next_1.Syntax.ExpressionStatement && node.expression.type === esprima_next_1.Syntax.ObjectExpression);
    return syntaxNodeToValue(jsExpression?.expression);
}
const jsonParse = (jsonString, options) => {
    try {
        return JSON.parse(jsonString);
    }
    catch (error) {
        if (options?.acceptJSObject) {
            try {
                const jsonStringCleaned = parseJSObject(jsonString);
                return jsonStringCleaned;
            }
            catch (e) {
            }
        }
        if (options?.fallbackValue !== undefined) {
            if (options.fallbackValue instanceof Function) {
                return options.fallbackValue();
            }
            return options.fallbackValue;
        }
        else if (options?.errorMessage) {
            throw new application_error_1.ApplicationError(options.errorMessage);
        }
        throw error;
    }
};
exports.jsonParse = jsonParse;
const replaceCircularReferences = (value, knownObjects = new WeakSet()) => {
    if (typeof value !== 'object' || value === null || value instanceof RegExp)
        return value;
    if ('toJSON' in value && typeof value.toJSON === 'function')
        return value.toJSON();
    if (knownObjects.has(value))
        return '[Circular Reference]';
    knownObjects.add(value);
    const copy = (Array.isArray(value) ? [] : {});
    for (const key in value) {
        copy[key] = (0, exports.replaceCircularReferences)(value[key], knownObjects);
    }
    knownObjects.delete(value);
    return copy;
};
exports.replaceCircularReferences = replaceCircularReferences;
const jsonStringify = (obj, options = {}) => {
    return JSON.stringify(options?.replaceCircularRefs ? (0, exports.replaceCircularReferences)(obj) : obj);
};
exports.jsonStringify = jsonStringify;
const sleep = async (ms) => await new Promise((resolve) => {
    setTimeout(resolve, ms);
});
exports.sleep = sleep;
function fileTypeFromMimeType(mimeType) {
    if (mimeType.startsWith('application/json'))
        return 'json';
    if (mimeType.startsWith('text/html'))
        return 'html';
    if (mimeType.startsWith('image/'))
        return 'image';
    if (mimeType.startsWith('audio/'))
        return 'audio';
    if (mimeType.startsWith('video/'))
        return 'video';
    if (mimeType.startsWith('text/') || mimeType.startsWith('application/javascript'))
        return 'text';
    if (mimeType.startsWith('application/pdf'))
        return 'pdf';
    return;
}
function assert(condition, msg) {
    if (!condition) {
        const error = new Error(msg ?? 'Invalid assertion');
        if (Error.hasOwnProperty('captureStackTrace')) {
            Error.captureStackTrace(error, assert);
        }
        else if (error.stack) {
            error.stack = error.stack
                .split('\n')
                .slice(1)
                .join('\n');
        }
        throw error;
    }
}
const isTraversableObject = (value) => {
    return value && typeof value === 'object' && !Array.isArray(value) && !!Object.keys(value).length;
};
exports.isTraversableObject = isTraversableObject;
const removeCircularRefs = (obj, seen = new Set()) => {
    seen.add(obj);
    Object.entries(obj).forEach(([key, value]) => {
        if ((0, exports.isTraversableObject)(value)) {
            seen.has(value) ? (obj[key] = { circularReference: true }) : (0, exports.removeCircularRefs)(value, seen);
            return;
        }
        if (Array.isArray(value)) {
            value.forEach((val, index) => {
                if (seen.has(val)) {
                    value[index] = { circularReference: true };
                    return;
                }
                if ((0, exports.isTraversableObject)(val)) {
                    (0, exports.removeCircularRefs)(val, seen);
                }
            });
        }
    });
};
exports.removeCircularRefs = removeCircularRefs;
function updateDisplayOptions(displayOptions, properties) {
    return properties.map((nodeProperty) => {
        return {
            ...nodeProperty,
            displayOptions: (0, lodash_1.merge)({}, nodeProperty.displayOptions, displayOptions),
        };
    });
}
function randomInt(min, max) {
    if (max === undefined) {
        max = min;
        min = 0;
    }
    return min + (crypto.getRandomValues(new Uint32Array(1))[0] % (max - min));
}
function randomString(minLength, maxLength) {
    const length = maxLength === undefined ? minLength : randomInt(minLength, maxLength + 1);
    return [...crypto.getRandomValues(new Uint32Array(length))]
        .map((byte) => Constants_1.ALPHABET[byte % Constants_1.ALPHABET.length])
        .join('');
}
function hasKey(value, key) {
    return value !== null && typeof value === 'object' && value.hasOwnProperty(key);
}
//# sourceMappingURL=utils.js.map