"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expression = void 0;
const tmpl = __importStar(require("@n8n_io/riot-tmpl"));
const luxon_1 = require("luxon");
const application_error_1 = require("./errors/application.error");
const expression_extension_error_1 = require("./errors/expression-extension.error");
const expression_error_1 = require("./errors/expression.error");
const ExpressionEvaluatorProxy_1 = require("./ExpressionEvaluatorProxy");
const ExpressionSandboxing_1 = require("./ExpressionSandboxing");
const Extensions_1 = require("./Extensions");
const ExpressionExtension_1 = require("./Extensions/ExpressionExtension");
const ExtendedFunctions_1 = require("./Extensions/ExtendedFunctions");
const GlobalState_1 = require("./GlobalState");
const WorkflowDataProxy_1 = require("./WorkflowDataProxy");
const IS_FRONTEND_IN_DEV_MODE = typeof process === 'object' &&
    Object.keys(process).length === 1 &&
    'env' in process &&
    Object.keys(process.env).length === 0;
const IS_FRONTEND = typeof process === 'undefined' || IS_FRONTEND_IN_DEV_MODE;
const isSyntaxError = (error) => error instanceof SyntaxError || (error instanceof Error && error.name === 'SyntaxError');
const isExpressionError = (error) => error instanceof expression_error_1.ExpressionError || error instanceof expression_extension_error_1.ExpressionExtensionError;
const isTypeError = (error) => error instanceof TypeError || (error instanceof Error && error.name === 'TypeError');
(0, ExpressionEvaluatorProxy_1.setErrorHandler)((error) => {
    if (isExpressionError(error))
        throw error;
});
const AsyncFunction = (async () => { }).constructor;
const fnConstructors = {
    sync: Function.prototype.constructor,
    async: AsyncFunction.prototype.constructor,
    mock: () => {
        throw new expression_error_1.ExpressionError('Arbitrary code execution detected');
    },
};
class Expression {
    constructor(workflow) {
        this.workflow = workflow;
    }
    static resolveWithoutWorkflow(expression, data = {}) {
        return tmpl.tmpl(expression, data);
    }
    convertObjectValueToString(value) {
        if (value instanceof luxon_1.DateTime && value.invalidReason !== null) {
            throw new application_error_1.ApplicationError('invalid DateTime');
        }
        if (value === null) {
            return 'null';
        }
        let typeName = value.constructor.name ?? 'Object';
        if (luxon_1.DateTime.isDateTime(value)) {
            typeName = 'DateTime';
        }
        let result = '';
        if (value instanceof Date) {
            result = luxon_1.DateTime.fromJSDate(value, {
                zone: this.workflow.settings?.timezone ?? (0, GlobalState_1.getGlobalState)().defaultTimezone,
            }).toISO();
        }
        else if (luxon_1.DateTime.isDateTime(value)) {
            result = value.toString();
        }
        else {
            result = JSON.stringify(value);
        }
        result = result
            .replace(/,"/g, ', "')
            .replace(/":/g, '": ');
        return `[${typeName}: ${result}]`;
    }
    resolveSimpleParameterValue(parameterValue, siblingParameters, runExecutionData, runIndex, itemIndex, activeNodeName, connectionInputData, mode, additionalKeys, executeData, returnObjectAsString = false, selfData = {}, contextNodeName) {
        if (typeof parameterValue !== 'string' || parameterValue.charAt(0) !== '=') {
            return parameterValue;
        }
        parameterValue = parameterValue.substr(1);
        const dataProxy = new WorkflowDataProxy_1.WorkflowDataProxy(this.workflow, runExecutionData, runIndex, itemIndex, activeNodeName, connectionInputData, siblingParameters, mode, additionalKeys, executeData, -1, selfData, contextNodeName);
        const data = dataProxy.getDataProxy();
        data.process =
            typeof process !== 'undefined'
                ? {
                    arch: process.arch,
                    env: process.env.N8N_BLOCK_ENV_ACCESS_IN_NODE === 'true' ? {} : process.env,
                    platform: process.platform,
                    pid: process.pid,
                    ppid: process.ppid,
                    release: process.release,
                    version: process.pid,
                    versions: process.versions,
                }
                : {};
        data.document = {};
        data.global = {};
        data.window = {};
        data.Window = {};
        data.this = {};
        data.globalThis = {};
        data.self = {};
        data.alert = {};
        data.prompt = {};
        data.confirm = {};
        data.eval = {};
        data.uneval = {};
        data.setTimeout = {};
        data.setInterval = {};
        data.Function = {};
        data.fetch = {};
        data.XMLHttpRequest = {};
        data.Promise = {};
        data.Generator = {};
        data.GeneratorFunction = {};
        data.AsyncFunction = {};
        data.AsyncGenerator = {};
        data.AsyncGeneratorFunction = {};
        data.WebAssembly = {};
        data.Reflect = {};
        data.Proxy = {};
        data.constructor = {};
        data.escape = {};
        data.unescape = {};
        data.Date = Date;
        data.DateTime = luxon_1.DateTime;
        data.Interval = luxon_1.Interval;
        data.Duration = luxon_1.Duration;
        data.Object = Object;
        data.Array = Array;
        data.Int8Array = Int8Array;
        data.Uint8Array = Uint8Array;
        data.Uint8ClampedArray = Uint8ClampedArray;
        data.Int16Array = Int16Array;
        data.Uint16Array = Uint16Array;
        data.Int32Array = Int32Array;
        data.Uint32Array = Uint32Array;
        data.Float32Array = Float32Array;
        data.Float64Array = Float64Array;
        data.BigInt64Array = typeof BigInt64Array !== 'undefined' ? BigInt64Array : {};
        data.BigUint64Array = typeof BigUint64Array !== 'undefined' ? BigUint64Array : {};
        data.Map = typeof Map !== 'undefined' ? Map : {};
        data.WeakMap = typeof WeakMap !== 'undefined' ? WeakMap : {};
        data.Set = typeof Set !== 'undefined' ? Set : {};
        data.WeakSet = typeof WeakSet !== 'undefined' ? WeakSet : {};
        data.Error = Error;
        data.TypeError = TypeError;
        data.SyntaxError = SyntaxError;
        data.EvalError = EvalError;
        data.RangeError = RangeError;
        data.ReferenceError = ReferenceError;
        data.URIError = URIError;
        data.Intl = typeof Intl !== 'undefined' ? Intl : {};
        data.String = String;
        data.RegExp = RegExp;
        data.Math = Math;
        data.Number = Number;
        data.BigInt = typeof BigInt !== 'undefined' ? BigInt : {};
        data.Infinity = Infinity;
        data.NaN = NaN;
        data.isFinite = Number.isFinite;
        data.isNaN = Number.isNaN;
        data.parseFloat = parseFloat;
        data.parseInt = parseInt;
        data.JSON = JSON;
        data.ArrayBuffer = typeof ArrayBuffer !== 'undefined' ? ArrayBuffer : {};
        data.SharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined' ? SharedArrayBuffer : {};
        data.Atomics = typeof Atomics !== 'undefined' ? Atomics : {};
        data.DataView = typeof DataView !== 'undefined' ? DataView : {};
        data.encodeURI = encodeURI;
        data.encodeURIComponent = encodeURIComponent;
        data.decodeURI = decodeURI;
        data.decodeURIComponent = decodeURIComponent;
        data.Boolean = Boolean;
        data.Symbol = Symbol;
        data.extend = Extensions_1.extend;
        data.extendOptional = Extensions_1.extendOptional;
        data[ExpressionSandboxing_1.sanitizerName] = ExpressionSandboxing_1.sanitizer;
        Object.assign(data, ExtendedFunctions_1.extendedFunctions);
        const constructorValidation = new RegExp(/\.\s*constructor/gm);
        if (parameterValue.match(constructorValidation)) {
            throw new expression_error_1.ExpressionError('Expression contains invalid constructor function call', {
                causeDetailed: 'Constructor override attempt is not allowed due to security concerns',
                runIndex,
                itemIndex,
            });
        }
        const extendedExpression = (0, ExpressionExtension_1.extendSyntax)(parameterValue);
        const returnValue = this.renderExpression(extendedExpression, data);
        if (typeof returnValue === 'function') {
            if (returnValue.name === '$')
                throw new application_error_1.ApplicationError('invalid syntax');
            if (returnValue.name === 'DateTime')
                throw new application_error_1.ApplicationError('this is a DateTime, please access its methods');
            throw new application_error_1.ApplicationError('this is a function, please add ()');
        }
        else if (typeof returnValue === 'string') {
            return returnValue;
        }
        else if (returnValue !== null && typeof returnValue === 'object') {
            if (returnObjectAsString) {
                return this.convertObjectValueToString(returnValue);
            }
        }
        return returnValue;
    }
    renderExpression(expression, data) {
        try {
            [Function, AsyncFunction].forEach(({ prototype }) => Object.defineProperty(prototype, 'constructor', { value: fnConstructors.mock }));
            return (0, ExpressionEvaluatorProxy_1.evaluateExpression)(expression, data);
        }
        catch (error) {
            if (isExpressionError(error))
                throw error;
            if (isSyntaxError(error))
                throw new application_error_1.ApplicationError('invalid syntax');
            if (isTypeError(error) && IS_FRONTEND && error.message.endsWith('is not a function')) {
                const match = error.message.match(/(?<msg>[^.]+is not a function)/);
                if (!match?.groups?.msg)
                    return null;
                throw new application_error_1.ApplicationError(match.groups.msg);
            }
        }
        finally {
            Object.defineProperty(Function.prototype, 'constructor', { value: fnConstructors.sync });
            Object.defineProperty(AsyncFunction.prototype, 'constructor', {
                value: fnConstructors.async,
            });
        }
        return null;
    }
    getSimpleParameterValue(node, parameterValue, mode, additionalKeys, executeData, defaultValue) {
        if (parameterValue === undefined) {
            return defaultValue;
        }
        const runIndex = 0;
        const itemIndex = 0;
        const connectionInputData = [];
        const runData = {
            resultData: {
                runData: {},
            },
        };
        return this.getParameterValue(parameterValue, runData, runIndex, itemIndex, node.name, connectionInputData, mode, additionalKeys, executeData);
    }
    getComplexParameterValue(node, parameterValue, mode, additionalKeys, executeData, defaultValue = undefined, selfData = {}) {
        if (parameterValue === undefined) {
            return defaultValue;
        }
        const runIndex = 0;
        const itemIndex = 0;
        const connectionInputData = [];
        const runData = {
            resultData: {
                runData: {},
            },
        };
        const returnData = this.getParameterValue(parameterValue, runData, runIndex, itemIndex, node.name, connectionInputData, mode, additionalKeys, executeData, false, selfData);
        return this.getParameterValue(returnData, runData, runIndex, itemIndex, node.name, connectionInputData, mode, additionalKeys, executeData, false, selfData);
    }
    getParameterValue(parameterValue, runExecutionData, runIndex, itemIndex, activeNodeName, connectionInputData, mode, additionalKeys, executeData, returnObjectAsString = false, selfData = {}, contextNodeName) {
        const isComplexParameter = (value) => {
            return typeof value === 'object';
        };
        const resolveParameterValue = (value, siblingParameters) => {
            if (isComplexParameter(value)) {
                return this.getParameterValue(value, runExecutionData, runIndex, itemIndex, activeNodeName, connectionInputData, mode, additionalKeys, executeData, returnObjectAsString, selfData, contextNodeName);
            }
            return this.resolveSimpleParameterValue(value, siblingParameters, runExecutionData, runIndex, itemIndex, activeNodeName, connectionInputData, mode, additionalKeys, executeData, returnObjectAsString, selfData, contextNodeName);
        };
        if (!isComplexParameter(parameterValue)) {
            return this.resolveSimpleParameterValue(parameterValue, {}, runExecutionData, runIndex, itemIndex, activeNodeName, connectionInputData, mode, additionalKeys, executeData, returnObjectAsString, selfData, contextNodeName);
        }
        if (Array.isArray(parameterValue)) {
            const returnData = parameterValue.map((item) => resolveParameterValue(item, {}));
            return returnData;
        }
        if (parameterValue === null || parameterValue === undefined) {
            return parameterValue;
        }
        if (typeof parameterValue !== 'object') {
            return {};
        }
        const returnData = {};
        for (const [key, value] of Object.entries(parameterValue)) {
            returnData[key] = resolveParameterValue(value, parameterValue);
        }
        if (returnObjectAsString && typeof returnData === 'object') {
            return this.convertObjectValueToString(returnData);
        }
        return returnData;
    }
}
exports.Expression = Expression;
//# sourceMappingURL=Expression.js.map