"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronNodeOptions = void 0;
exports.isSubNodeType = isSubNodeType;
exports.applyDeclarativeNodeOptionParameters = applyDeclarativeNodeOptionParameters;
exports.displayParameter = displayParameter;
exports.displayParameterPath = displayParameterPath;
exports.getContext = getContext;
exports.getParameterResolveOrder = getParameterResolveOrder;
exports.getNodeParameters = getNodeParameters;
exports.getNodeWebhookPath = getNodeWebhookPath;
exports.getNodeWebhookUrl = getNodeWebhookUrl;
exports.getConnectionTypes = getConnectionTypes;
exports.getNodeInputs = getNodeInputs;
exports.getNodeHints = getNodeHints;
exports.getNodeOutputs = getNodeOutputs;
exports.getNodeParametersIssues = getNodeParametersIssues;
exports.nodeIssuesToString = nodeIssuesToString;
exports.getParameterValueByPath = getParameterValueByPath;
exports.getParameterIssues = getParameterIssues;
exports.mergeIssues = mergeIssues;
exports.mergeNodeProperties = mergeNodeProperties;
exports.getVersionedNodeType = getVersionedNodeType;
exports.isTriggerNode = isTriggerNode;
exports.isExecutable = isExecutable;
const get_1 = __importDefault(require("lodash/get"));
const isEqual_1 = __importDefault(require("lodash/isEqual"));
const application_error_1 = require("./errors/application.error");
const FilterParameter_1 = require("./NodeParameters/FilterParameter");
const type_guards_1 = require("./type-guards");
const TypeValidation_1 = require("./TypeValidation");
const utils_1 = require("./utils");
exports.cronNodeOptions = [
    {
        name: 'item',
        displayName: 'Item',
        values: [
            {
                displayName: 'Mode',
                name: 'mode',
                type: 'options',
                options: [
                    {
                        name: 'Every Minute',
                        value: 'everyMinute',
                    },
                    {
                        name: 'Every Hour',
                        value: 'everyHour',
                    },
                    {
                        name: 'Every Day',
                        value: 'everyDay',
                    },
                    {
                        name: 'Every Week',
                        value: 'everyWeek',
                    },
                    {
                        name: 'Every Month',
                        value: 'everyMonth',
                    },
                    {
                        name: 'Every X',
                        value: 'everyX',
                    },
                    {
                        name: 'Custom',
                        value: 'custom',
                    },
                ],
                default: 'everyDay',
                description: 'How often to trigger.',
            },
            {
                displayName: 'Hour',
                name: 'hour',
                type: 'number',
                typeOptions: {
                    minValue: 0,
                    maxValue: 23,
                },
                displayOptions: {
                    hide: {
                        mode: ['custom', 'everyHour', 'everyMinute', 'everyX'],
                    },
                },
                default: 14,
                description: 'The hour of the day to trigger (24h format)',
            },
            {
                displayName: 'Minute',
                name: 'minute',
                type: 'number',
                typeOptions: {
                    minValue: 0,
                    maxValue: 59,
                },
                displayOptions: {
                    hide: {
                        mode: ['custom', 'everyMinute', 'everyX'],
                    },
                },
                default: 0,
                description: 'The minute of the day to trigger',
            },
            {
                displayName: 'Day of Month',
                name: 'dayOfMonth',
                type: 'number',
                displayOptions: {
                    show: {
                        mode: ['everyMonth'],
                    },
                },
                typeOptions: {
                    minValue: 1,
                    maxValue: 31,
                },
                default: 1,
                description: 'The day of the month to trigger',
            },
            {
                displayName: 'Weekday',
                name: 'weekday',
                type: 'options',
                displayOptions: {
                    show: {
                        mode: ['everyWeek'],
                    },
                },
                options: [
                    {
                        name: 'Monday',
                        value: '1',
                    },
                    {
                        name: 'Tuesday',
                        value: '2',
                    },
                    {
                        name: 'Wednesday',
                        value: '3',
                    },
                    {
                        name: 'Thursday',
                        value: '4',
                    },
                    {
                        name: 'Friday',
                        value: '5',
                    },
                    {
                        name: 'Saturday',
                        value: '6',
                    },
                    {
                        name: 'Sunday',
                        value: '0',
                    },
                ],
                default: '1',
                description: 'The weekday to trigger',
            },
            {
                displayName: 'Cron Expression',
                name: 'cronExpression',
                type: 'string',
                displayOptions: {
                    show: {
                        mode: ['custom'],
                    },
                },
                default: '* * * * * *',
                description: 'Use custom cron expression. Values and ranges as follows:<ul><li>Seconds: 0-59</li><li>Minutes: 0 - 59</li><li>Hours: 0 - 23</li><li>Day of Month: 1 - 31</li><li>Months: 0 - 11 (Jan - Dec)</li><li>Day of Week: 0 - 6 (Sun - Sat)</li></ul>',
            },
            {
                displayName: 'Value',
                name: 'value',
                type: 'number',
                typeOptions: {
                    minValue: 0,
                    maxValue: 1000,
                },
                displayOptions: {
                    show: {
                        mode: ['everyX'],
                    },
                },
                default: 2,
                description: 'All how many X minutes/hours it should trigger',
            },
            {
                displayName: 'Unit',
                name: 'unit',
                type: 'options',
                displayOptions: {
                    show: {
                        mode: ['everyX'],
                    },
                },
                options: [
                    {
                        name: 'Minutes',
                        value: 'minutes',
                    },
                    {
                        name: 'Hours',
                        value: 'hours',
                    },
                ],
                default: 'hours',
                description: 'If it should trigger all X minutes or hours',
            },
        ],
    },
];
const declarativeNodeOptionParameters = {
    displayName: 'Request Options',
    name: 'requestOptions',
    type: 'collection',
    isNodeSetting: true,
    placeholder: 'Add Option',
    default: {},
    options: [
        {
            displayName: 'Batching',
            name: 'batching',
            placeholder: 'Add Batching',
            type: 'fixedCollection',
            typeOptions: {
                multipleValues: false,
            },
            default: {
                batch: {},
            },
            options: [
                {
                    displayName: 'Batching',
                    name: 'batch',
                    values: [
                        {
                            displayName: 'Items per Batch',
                            name: 'batchSize',
                            type: 'number',
                            typeOptions: {
                                minValue: -1,
                            },
                            default: 50,
                            description: 'Input will be split in batches to throttle requests. -1 for disabled. 0 will be treated as 1.',
                        },
                        {
                            displayName: 'Batch Interval (ms)',
                            name: 'batchInterval',
                            type: 'number',
                            typeOptions: {
                                minValue: 0,
                            },
                            default: 1000,
                            description: 'Time (in milliseconds) between each batch of requests. 0 for disabled.',
                        },
                    ],
                },
            ],
        },
        {
            displayName: 'Ignore SSL Issues (Insecure)',
            name: 'allowUnauthorizedCerts',
            type: 'boolean',
            noDataExpression: true,
            default: false,
            description: 'Whether to accept the response even if SSL certificate validation is not possible',
        },
        {
            displayName: 'Proxy',
            name: 'proxy',
            type: 'string',
            default: '',
            placeholder: 'e.g. http://myproxy:3128',
            description: 'HTTP proxy to use. If authentication is required it can be defined as follow: http://username:password@myproxy:3128',
        },
        {
            displayName: 'Timeout',
            name: 'timeout',
            type: 'number',
            typeOptions: {
                minValue: 1,
            },
            default: 10000,
            description: 'Time in ms to wait for the server to send response headers (and start the response body) before aborting the request',
        },
    ],
};
function isSubNodeType(typeDescription) {
    if (!typeDescription?.outputs || typeof typeDescription.outputs === 'string') {
        return false;
    }
    const outputTypes = getConnectionTypes(typeDescription.outputs);
    return outputTypes
        ? outputTypes.filter((output) => output !== "main").length > 0
        : false;
}
function applyDeclarativeNodeOptionParameters(nodeType) {
    if (nodeType.execute ||
        nodeType.trigger ||
        nodeType.webhook ||
        nodeType.description.polling ||
        isSubNodeType(nodeType.description)) {
        return;
    }
    const parameters = nodeType.description.properties;
    if (!parameters) {
        return;
    }
    const existingRequestOptionsIndex = parameters.findIndex((parameter) => parameter.name === 'requestOptions');
    if (existingRequestOptionsIndex !== -1) {
        parameters[existingRequestOptionsIndex] = {
            ...declarativeNodeOptionParameters,
            options: [
                ...(declarativeNodeOptionParameters.options || []),
                ...(parameters[existingRequestOptionsIndex]?.options || []),
            ],
        };
        const options = parameters[existingRequestOptionsIndex]?.options;
        if (options) {
            options.sort((a, b) => {
                if ('displayName' in a && 'displayName' in b) {
                    if (a.displayName < b.displayName) {
                        return -1;
                    }
                    if (a.displayName > b.displayName) {
                        return 1;
                    }
                }
                return 0;
            });
        }
    }
    else {
        parameters.push(declarativeNodeOptionParameters);
    }
    return;
}
const getPropertyValues = (nodeValues, propertyName, node, nodeValuesRoot) => {
    let value;
    if (propertyName.charAt(0) === '/') {
        value = (0, get_1.default)(nodeValuesRoot, propertyName.slice(1));
    }
    else if (propertyName === '@version') {
        value = node?.typeVersion || 0;
    }
    else {
        value = (0, get_1.default)(nodeValues, propertyName);
    }
    if (value && typeof value === 'object' && '__rl' in value && value.__rl) {
        value = value.value;
    }
    if (!Array.isArray(value)) {
        return [value];
    }
    else {
        return value;
    }
};
const checkConditions = (conditions, actualValues) => {
    return conditions.some((condition) => {
        if (condition &&
            typeof condition === 'object' &&
            condition._cnd &&
            Object.keys(condition).length === 1) {
            const [key, targetValue] = Object.entries(condition._cnd)[0];
            return actualValues.every((propertyValue) => {
                if (key === 'eq') {
                    return (0, isEqual_1.default)(propertyValue, targetValue);
                }
                if (key === 'not') {
                    return !(0, isEqual_1.default)(propertyValue, targetValue);
                }
                if (key === 'gte') {
                    return propertyValue >= targetValue;
                }
                if (key === 'lte') {
                    return propertyValue <= targetValue;
                }
                if (key === 'gt') {
                    return propertyValue > targetValue;
                }
                if (key === 'lt') {
                    return propertyValue < targetValue;
                }
                if (key === 'between') {
                    const { from, to } = targetValue;
                    return propertyValue >= from && propertyValue <= to;
                }
                if (key === 'includes') {
                    return propertyValue.includes(targetValue);
                }
                if (key === 'startsWith') {
                    return propertyValue.startsWith(targetValue);
                }
                if (key === 'endsWith') {
                    return propertyValue.endsWith(targetValue);
                }
                if (key === 'regex') {
                    return new RegExp(targetValue).test(propertyValue);
                }
                if (key === 'exists') {
                    return propertyValue !== null && propertyValue !== undefined && propertyValue !== '';
                }
                return false;
            });
        }
        return actualValues.includes(condition);
    });
};
function displayParameter(nodeValues, parameter, node, nodeValuesRoot, displayKey = 'displayOptions') {
    if (!parameter[displayKey]) {
        return true;
    }
    const { show, hide } = parameter[displayKey];
    nodeValuesRoot = nodeValuesRoot || nodeValues;
    if (show) {
        for (const propertyName of Object.keys(show)) {
            const values = getPropertyValues(nodeValues, propertyName, node, nodeValuesRoot);
            if (values.some((v) => typeof v === 'string' && v.charAt(0) === '=')) {
                return true;
            }
            if (values.length === 0 || !checkConditions(show[propertyName], values)) {
                return false;
            }
        }
    }
    if (hide) {
        for (const propertyName of Object.keys(hide)) {
            const values = getPropertyValues(nodeValues, propertyName, node, nodeValuesRoot);
            if (values.length !== 0 && checkConditions(hide[propertyName], values)) {
                return false;
            }
        }
    }
    return true;
}
function displayParameterPath(nodeValues, parameter, path, node, displayKey = 'displayOptions') {
    let resolvedNodeValues = nodeValues;
    if (path !== '') {
        resolvedNodeValues = (0, get_1.default)(nodeValues, path);
    }
    let nodeValuesRoot = nodeValues;
    if (path && path.split('.').indexOf('parameters') === 0) {
        nodeValuesRoot = (0, get_1.default)(nodeValues, 'parameters');
    }
    return displayParameter(resolvedNodeValues, parameter, node, nodeValuesRoot, displayKey);
}
function getContext(runExecutionData, type, node) {
    if (runExecutionData.executionData === undefined) {
        throw new application_error_1.ApplicationError('`executionData` is not initialized');
    }
    let key;
    if (type === 'flow') {
        key = 'flow';
    }
    else if (type === 'node') {
        if (node === undefined) {
            throw new application_error_1.ApplicationError('The request data of context type "node" the node parameter has to be set!');
        }
        key = `node:${node.name}`;
    }
    else {
        throw new application_error_1.ApplicationError('Unknown context type. Only `flow` and `node` are supported.', {
            extra: { contextType: type },
        });
    }
    if (runExecutionData.executionData.contextData[key] === undefined) {
        runExecutionData.executionData.contextData[key] = {};
    }
    return runExecutionData.executionData.contextData[key];
}
function getParameterDependencies(nodePropertiesArray) {
    const dependencies = {};
    for (const nodeProperties of nodePropertiesArray) {
        const { name, displayOptions } = nodeProperties;
        if (!dependencies[name]) {
            dependencies[name] = [];
        }
        if (!displayOptions) {
            continue;
        }
        for (const displayRule of Object.values(displayOptions)) {
            for (const parameterName of Object.keys(displayRule)) {
                if (!dependencies[name].includes(parameterName)) {
                    if (parameterName.charAt(0) === '@') {
                        continue;
                    }
                    dependencies[name].push(parameterName);
                }
            }
        }
    }
    return dependencies;
}
function getParameterResolveOrder(nodePropertiesArray, parameterDependencies) {
    const executionOrder = [];
    const indexToResolve = Array.from({ length: nodePropertiesArray.length }, (_, k) => k);
    const resolvedParameters = [];
    let index;
    let property;
    let lastIndexLength = indexToResolve.length;
    let lastIndexReduction = -1;
    let iterations = 0;
    while (indexToResolve.length !== 0) {
        iterations += 1;
        index = indexToResolve.shift();
        property = nodePropertiesArray[index];
        if (parameterDependencies[property.name].length === 0) {
            executionOrder.push(index);
            resolvedParameters.push(property.name);
            continue;
        }
        for (const dependency of parameterDependencies[property.name]) {
            if (!resolvedParameters.includes(dependency)) {
                if (dependency.charAt(0) === '/') {
                    continue;
                }
                indexToResolve.push(index);
                continue;
            }
        }
        executionOrder.push(index);
        resolvedParameters.push(property.name);
        if (indexToResolve.length < lastIndexLength) {
            lastIndexReduction = iterations;
        }
        if (iterations > lastIndexReduction + nodePropertiesArray.length) {
            throw new application_error_1.ApplicationError('Could not resolve parameter dependencies. Max iterations reached! Hint: If `displayOptions` are specified in any child parameter of a parent `collection` or `fixedCollection`, remove the `displayOptions` from the child parameter.');
        }
        lastIndexLength = indexToResolve.length;
    }
    return executionOrder;
}
function getNodeParameters(nodePropertiesArray, nodeValues, returnDefaults, returnNoneDisplayed, node, onlySimpleTypes = false, dataIsResolved = false, nodeValuesRoot, parentType, parameterDependencies) {
    if (parameterDependencies === undefined) {
        parameterDependencies = getParameterDependencies(nodePropertiesArray);
    }
    const duplicateParameterNames = [];
    const parameterNames = [];
    for (const nodeProperties of nodePropertiesArray) {
        if (parameterNames.includes(nodeProperties.name)) {
            if (!duplicateParameterNames.includes(nodeProperties.name)) {
                duplicateParameterNames.push(nodeProperties.name);
            }
        }
        else {
            parameterNames.push(nodeProperties.name);
        }
    }
    const nodeParameters = {};
    const nodeParametersFull = {};
    let nodeValuesDisplayCheck = nodeParametersFull;
    if (!dataIsResolved && !returnNoneDisplayed) {
        nodeValuesDisplayCheck = getNodeParameters(nodePropertiesArray, nodeValues, true, true, node, true, true, nodeValuesRoot, parentType, parameterDependencies);
    }
    nodeValuesRoot = nodeValuesRoot || nodeValuesDisplayCheck;
    const parameterIterationOrderIndex = getParameterResolveOrder(nodePropertiesArray, parameterDependencies);
    for (const parameterIndex of parameterIterationOrderIndex) {
        const nodeProperties = nodePropertiesArray[parameterIndex];
        if (!nodeValues ||
            (nodeValues[nodeProperties.name] === undefined &&
                (!returnDefaults || parentType === 'collection'))) {
            continue;
        }
        if (!returnNoneDisplayed &&
            !displayParameter(nodeValuesDisplayCheck, nodeProperties, node, nodeValuesRoot)) {
            if (!returnNoneDisplayed || !returnDefaults) {
                continue;
            }
        }
        if (!['collection', 'fixedCollection'].includes(nodeProperties.type)) {
            if (duplicateParameterNames.includes(nodeProperties.name)) {
                if (!displayParameter(nodeValuesDisplayCheck, nodeProperties, node, nodeValuesRoot)) {
                    continue;
                }
            }
            if (returnDefaults) {
                if (['boolean', 'number', 'options'].includes(nodeProperties.type)) {
                    nodeParameters[nodeProperties.name] =
                        nodeValues[nodeProperties.name] !== undefined
                            ? nodeValues[nodeProperties.name]
                            : nodeProperties.default;
                }
                else if (nodeProperties.type === 'resourceLocator' &&
                    typeof nodeProperties.default === 'object') {
                    nodeParameters[nodeProperties.name] =
                        nodeValues[nodeProperties.name] !== undefined
                            ? nodeValues[nodeProperties.name]
                            : { __rl: true, ...nodeProperties.default };
                }
                else {
                    nodeParameters[nodeProperties.name] =
                        nodeValues[nodeProperties.name] ?? nodeProperties.default;
                }
                nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
            }
            else if ((nodeValues[nodeProperties.name] !== nodeProperties.default &&
                typeof nodeValues[nodeProperties.name] !== 'object') ||
                (typeof nodeValues[nodeProperties.name] === 'object' &&
                    !(0, isEqual_1.default)(nodeValues[nodeProperties.name], nodeProperties.default)) ||
                (nodeValues[nodeProperties.name] !== undefined && parentType === 'collection')) {
                nodeParameters[nodeProperties.name] = nodeValues[nodeProperties.name];
                nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
                continue;
            }
        }
        if (onlySimpleTypes) {
            continue;
        }
        let tempValue;
        if (nodeProperties.type === 'collection') {
            if (nodeProperties.typeOptions !== undefined &&
                nodeProperties.typeOptions.multipleValues === true) {
                if (nodeValues[nodeProperties.name] !== undefined) {
                    nodeParameters[nodeProperties.name] = nodeValues[nodeProperties.name];
                }
                else if (returnDefaults) {
                    if (Array.isArray(nodeProperties.default)) {
                        nodeParameters[nodeProperties.name] = (0, utils_1.deepCopy)(nodeProperties.default);
                    }
                    else {
                        nodeParameters[nodeProperties.name] = [];
                    }
                }
                nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
            }
            else if (nodeValues[nodeProperties.name] !== undefined) {
                const tempNodeParameters = getNodeParameters(nodeProperties.options, nodeValues[nodeProperties.name], returnDefaults, returnNoneDisplayed, node, false, false, nodeValuesRoot, nodeProperties.type);
                if (tempNodeParameters !== null) {
                    nodeParameters[nodeProperties.name] = tempNodeParameters;
                    nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
                }
            }
            else if (returnDefaults) {
                nodeParameters[nodeProperties.name] = (0, utils_1.deepCopy)(nodeProperties.default);
                nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
            }
        }
        else if (nodeProperties.type === 'fixedCollection') {
            const collectionValues = {};
            let tempNodeParameters;
            let tempNodePropertiesArray;
            let nodePropertyOptions;
            let propertyValues = nodeValues[nodeProperties.name];
            if (returnDefaults) {
                if (propertyValues === undefined) {
                    propertyValues = (0, utils_1.deepCopy)(nodeProperties.default);
                }
            }
            if (!returnDefaults &&
                nodeProperties.typeOptions?.multipleValues === false &&
                propertyValues &&
                Object.keys(propertyValues).length === 0) {
                return nodeValues;
            }
            for (const itemName of Object.keys(propertyValues || {})) {
                if (nodeProperties.typeOptions !== undefined &&
                    nodeProperties.typeOptions.multipleValues === true) {
                    const tempArrayValue = [];
                    for (const nodeValue of propertyValues[itemName]) {
                        nodePropertyOptions = nodeProperties.options.find((nodePropertyOptions) => nodePropertyOptions.name === itemName);
                        if (nodePropertyOptions === undefined) {
                            throw new application_error_1.ApplicationError('Could not find property option', {
                                extra: { propertyOption: itemName, property: nodeProperties.name },
                            });
                        }
                        tempNodePropertiesArray = nodePropertyOptions.values;
                        tempValue = getNodeParameters(tempNodePropertiesArray, nodeValue, returnDefaults, returnNoneDisplayed, node, false, false, nodeValuesRoot, nodeProperties.type);
                        if (tempValue !== null) {
                            tempArrayValue.push(tempValue);
                        }
                    }
                    collectionValues[itemName] = tempArrayValue;
                }
                else {
                    tempNodeParameters = {};
                    const nodePropertyOptions = nodeProperties.options.find((data) => data.name === itemName);
                    if (nodePropertyOptions !== undefined) {
                        tempNodePropertiesArray = nodePropertyOptions.values;
                        tempValue = getNodeParameters(tempNodePropertiesArray, nodeValues[nodeProperties.name][itemName], returnDefaults, returnNoneDisplayed, node, false, false, nodeValuesRoot, nodeProperties.type);
                        if (tempValue !== null) {
                            Object.assign(tempNodeParameters, tempValue);
                        }
                    }
                    if (Object.keys(tempNodeParameters).length !== 0) {
                        collectionValues[itemName] = tempNodeParameters;
                    }
                }
            }
            if (!returnDefaults &&
                nodeProperties.typeOptions?.multipleValues === false &&
                collectionValues &&
                Object.keys(collectionValues).length === 0 &&
                propertyValues &&
                propertyValues?.constructor.name === 'Object' &&
                Object.keys(propertyValues).length !== 0) {
                const returnValue = {};
                Object.keys(propertyValues || {}).forEach((value) => {
                    returnValue[value] = {};
                });
                nodeParameters[nodeProperties.name] = returnValue;
            }
            if (Object.keys(collectionValues).length !== 0 || returnDefaults) {
                if (returnDefaults) {
                    if (collectionValues === undefined) {
                        nodeParameters[nodeProperties.name] = (0, utils_1.deepCopy)(nodeProperties.default);
                    }
                    else {
                        nodeParameters[nodeProperties.name] = collectionValues;
                    }
                    nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
                }
                else if (collectionValues !== nodeProperties.default) {
                    nodeParameters[nodeProperties.name] = collectionValues;
                    nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
                }
            }
        }
    }
    return nodeParameters;
}
function getNodeWebhookPath(workflowId, node, path, isFullPath, restartWebhook) {
    let webhookPath = '';
    if (restartWebhook === true) {
        return path;
    }
    if (node.webhookId === undefined) {
        webhookPath = `${workflowId}/${encodeURIComponent(node.name.toLowerCase())}/${path}`;
    }
    else {
        if (isFullPath === true) {
            return path;
        }
        webhookPath = `${node.webhookId}/${path}`;
    }
    return webhookPath;
}
function getNodeWebhookUrl(baseUrl, workflowId, node, path, isFullPath) {
    if ((path.startsWith(':') || path.includes('/:')) && node.webhookId) {
        isFullPath = false;
    }
    if (path.startsWith('/')) {
        path = path.slice(1);
    }
    return `${baseUrl}/${getNodeWebhookPath(workflowId, node, path, isFullPath)}`;
}
function getConnectionTypes(connections) {
    return connections
        .map((connection) => {
        if (typeof connection === 'string') {
            return connection;
        }
        return connection.type;
    })
        .filter((connection) => connection !== undefined);
}
function getNodeInputs(workflow, node, nodeTypeData) {
    if (Array.isArray(nodeTypeData?.inputs)) {
        return nodeTypeData.inputs;
    }
    try {
        return (workflow.expression.getSimpleParameterValue(node, nodeTypeData.inputs, 'internal', {}) || []);
    }
    catch (e) {
        console.warn('Could not calculate inputs dynamically for node: ', node.name);
        return [];
    }
}
function getNodeHints(workflow, node, nodeTypeData, nodeInputData) {
    const hints = [];
    if (nodeTypeData?.hints?.length) {
        for (const hint of nodeTypeData.hints) {
            if (hint.displayCondition) {
                try {
                    let display;
                    if (nodeInputData === undefined) {
                        display = (workflow.expression.getSimpleParameterValue(node, hint.displayCondition, 'internal', {}) || false);
                    }
                    else {
                        const { runExecutionData, runIndex, connectionInputData } = nodeInputData;
                        display = workflow.expression.getParameterValue(hint.displayCondition, runExecutionData ?? null, runIndex, 0, node.name, connectionInputData, 'manual', {});
                    }
                    if (typeof display === 'string' && display.trim() === 'true') {
                        display = true;
                    }
                    if (typeof display !== 'boolean') {
                        console.warn(`Condition was not resolved as boolean in '${node.name}' node for hint: `, hint.message);
                        continue;
                    }
                    if (display) {
                        hints.push(hint);
                    }
                }
                catch (e) {
                    console.warn(`Could not calculate display condition in '${node.name}' node for hint: `, hint.message);
                }
            }
            else {
                hints.push(hint);
            }
        }
    }
    return hints;
}
function getNodeOutputs(workflow, node, nodeTypeData) {
    let outputs = [];
    if (Array.isArray(nodeTypeData.outputs)) {
        outputs = nodeTypeData.outputs;
    }
    else {
        try {
            outputs = (workflow.expression.getSimpleParameterValue(node, nodeTypeData.outputs, 'internal', {}) || []);
        }
        catch (e) {
            console.warn('Could not calculate outputs dynamically for node: ', node.name);
        }
    }
    if (node.onError === 'continueErrorOutput') {
        outputs = (0, utils_1.deepCopy)(outputs);
        if (outputs.length === 1) {
            if (typeof outputs[0] === 'string') {
                outputs[0] = {
                    type: outputs[0],
                };
            }
            outputs[0].displayName = 'Success';
        }
        return [
            ...outputs,
            {
                category: 'error',
                type: "main",
                displayName: 'Error',
            },
        ];
    }
    return outputs;
}
function getNodeParametersIssues(nodePropertiesArray, node, pinDataNodeNames) {
    const foundIssues = {};
    let propertyIssues;
    if (node.disabled === true || pinDataNodeNames?.includes(node.name)) {
        return null;
    }
    for (const nodeProperty of nodePropertiesArray) {
        propertyIssues = getParameterIssues(nodeProperty, node.parameters, '', node);
        mergeIssues(foundIssues, propertyIssues);
    }
    if (Object.keys(foundIssues).length === 0) {
        return null;
    }
    return foundIssues;
}
function nodeIssuesToString(issues, node) {
    const nodeIssues = [];
    if (issues.execution !== undefined) {
        nodeIssues.push('Execution Error.');
    }
    const objectProperties = ['parameters', 'credentials', 'input'];
    let issueText;
    let parameterName;
    for (const propertyName of objectProperties) {
        if (issues[propertyName] !== undefined) {
            for (parameterName of Object.keys(issues[propertyName])) {
                for (issueText of issues[propertyName][parameterName]) {
                    nodeIssues.push(issueText);
                }
            }
        }
    }
    if (issues.typeUnknown !== undefined) {
        if (node !== undefined) {
            nodeIssues.push(`Node Type "${node.type}" is not known.`);
        }
        else {
            nodeIssues.push('Node Type is not known.');
        }
    }
    return nodeIssues;
}
const validateResourceLocatorParameter = (value, parameterMode) => {
    const valueToValidate = value?.value?.toString() || '';
    if (valueToValidate.startsWith('=')) {
        return [];
    }
    const validationErrors = [];
    if (parameterMode.validation) {
        for (const validation of parameterMode.validation) {
            if (validation && validation.type === 'regex') {
                const regexValidation = validation;
                const regex = new RegExp(`^${regexValidation.properties.regex}$`);
                if (!regex.test(valueToValidate)) {
                    validationErrors.push(regexValidation.properties.errorMessage);
                }
            }
        }
    }
    return validationErrors;
};
const validateResourceMapperParameter = (nodeProperties, value, skipRequiredCheck = false) => {
    if (value.mappingMode === 'autoMapInputData') {
        return {};
    }
    const issues = {};
    let fieldWordSingular = nodeProperties.typeOptions?.resourceMapper?.fieldWords?.singular || 'Field';
    fieldWordSingular = fieldWordSingular.charAt(0).toUpperCase() + fieldWordSingular.slice(1);
    value.schema.forEach((field) => {
        const fieldValue = value.value ? value.value[field.id] : null;
        const key = `${nodeProperties.name}.${field.id}`;
        const fieldErrors = [];
        if (field.required && !skipRequiredCheck) {
            if (value.value === null || fieldValue === undefined) {
                const error = `${fieldWordSingular} "${field.id}" is required`;
                fieldErrors.push(error);
            }
        }
        if (!fieldValue?.toString().startsWith('=') && field.type) {
            const validationResult = (0, TypeValidation_1.validateFieldType)(field.id, fieldValue, field.type, {
                valueOptions: field.options,
            });
            if (!validationResult.valid && validationResult.errorMessage) {
                fieldErrors.push(validationResult.errorMessage);
            }
        }
        if (fieldErrors.length > 0) {
            issues[key] = fieldErrors;
        }
    });
    return issues;
};
const validateParameter = (nodeProperties, value, type) => {
    const nodeName = nodeProperties.name;
    const options = type === 'options' ? nodeProperties.options : undefined;
    if (!value?.toString().startsWith('=')) {
        const validationResult = (0, TypeValidation_1.validateFieldType)(nodeName, value, type, {
            valueOptions: options,
        });
        if (!validationResult.valid && validationResult.errorMessage) {
            return validationResult.errorMessage;
        }
    }
    return undefined;
};
function addToIssuesIfMissing(foundIssues, nodeProperties, value) {
    if ((nodeProperties.type === 'string' && (value === '' || value === undefined)) ||
        (nodeProperties.type === 'multiOptions' && Array.isArray(value) && value.length === 0) ||
        (nodeProperties.type === 'dateTime' && (value === '' || value === undefined)) ||
        (nodeProperties.type === 'options' && (value === '' || value === undefined)) ||
        ((nodeProperties.type === 'resourceLocator' || nodeProperties.type === 'workflowSelector') &&
            !(0, type_guards_1.isValidResourceLocatorParameterValue)(value))) {
        if (foundIssues.parameters === undefined) {
            foundIssues.parameters = {};
        }
        if (foundIssues.parameters[nodeProperties.name] === undefined) {
            foundIssues.parameters[nodeProperties.name] = [];
        }
        foundIssues.parameters[nodeProperties.name].push(`Parameter "${nodeProperties.displayName}" is required.`);
    }
}
function getParameterValueByPath(nodeValues, parameterName, path) {
    return (0, get_1.default)(nodeValues, path ? `${path}.${parameterName}` : parameterName);
}
function isINodeParameterResourceLocator(value) {
    return typeof value === 'object' && value !== null && 'value' in value && 'mode' in value;
}
function getParameterIssues(nodeProperties, nodeValues, path, node) {
    const foundIssues = {};
    const isDisplayed = displayParameterPath(nodeValues, nodeProperties, path, node);
    if (nodeProperties.required === true) {
        if (isDisplayed) {
            const value = getParameterValueByPath(nodeValues, nodeProperties.name, path);
            if (nodeProperties.typeOptions !== undefined &&
                nodeProperties.typeOptions.multipleValues !== undefined) {
                if (Array.isArray(value)) {
                    for (const singleValue of value) {
                        addToIssuesIfMissing(foundIssues, nodeProperties, singleValue);
                    }
                }
            }
            else {
                addToIssuesIfMissing(foundIssues, nodeProperties, value);
            }
        }
    }
    if ((nodeProperties.type === 'resourceLocator' || nodeProperties.type === 'workflowSelector') &&
        isDisplayed) {
        const value = getParameterValueByPath(nodeValues, nodeProperties.name, path);
        if (isINodeParameterResourceLocator(value)) {
            const mode = nodeProperties.modes?.find((option) => option.name === value.mode);
            if (mode) {
                const errors = validateResourceLocatorParameter(value, mode);
                errors.forEach((error) => {
                    if (foundIssues.parameters === undefined) {
                        foundIssues.parameters = {};
                    }
                    if (foundIssues.parameters[nodeProperties.name] === undefined) {
                        foundIssues.parameters[nodeProperties.name] = [];
                    }
                    foundIssues.parameters[nodeProperties.name].push(error);
                });
            }
        }
    }
    else if (nodeProperties.type === 'resourceMapper' && isDisplayed) {
        const skipRequiredCheck = nodeProperties.typeOptions?.resourceMapper?.mode !== 'add';
        const value = getParameterValueByPath(nodeValues, nodeProperties.name, path);
        if ((0, type_guards_1.isResourceMapperValue)(value)) {
            const issues = validateResourceMapperParameter(nodeProperties, value, skipRequiredCheck);
            if (Object.keys(issues).length > 0) {
                if (foundIssues.parameters === undefined) {
                    foundIssues.parameters = {};
                }
                if (foundIssues.parameters[nodeProperties.name] === undefined) {
                    foundIssues.parameters[nodeProperties.name] = [];
                }
                foundIssues.parameters = { ...foundIssues.parameters, ...issues };
            }
        }
    }
    else if (nodeProperties.type === 'filter' && isDisplayed) {
        const value = getParameterValueByPath(nodeValues, nodeProperties.name, path);
        if ((0, type_guards_1.isFilterValue)(value)) {
            const issues = (0, FilterParameter_1.validateFilterParameter)(nodeProperties, value);
            if (Object.keys(issues).length > 0) {
                foundIssues.parameters = { ...foundIssues.parameters, ...issues };
            }
        }
    }
    else if (nodeProperties.validateType) {
        const value = getParameterValueByPath(nodeValues, nodeProperties.name, path);
        const error = validateParameter(nodeProperties, value, nodeProperties.validateType);
        if (error) {
            if (foundIssues.parameters === undefined) {
                foundIssues.parameters = {};
            }
            if (foundIssues.parameters[nodeProperties.name] === undefined) {
                foundIssues.parameters[nodeProperties.name] = [];
            }
            foundIssues.parameters[nodeProperties.name].push(error);
        }
    }
    if (nodeProperties.options === undefined) {
        return foundIssues;
    }
    let basePath = path ? `${path}.` : '';
    const checkChildNodeProperties = [];
    if (nodeProperties.type === 'collection') {
        for (const option of nodeProperties.options) {
            checkChildNodeProperties.push({
                basePath,
                data: option,
            });
        }
    }
    else if (nodeProperties.type === 'fixedCollection' && isDisplayed) {
        basePath = basePath ? `${basePath}.` : `${nodeProperties.name}.`;
        let propertyOptions;
        for (propertyOptions of nodeProperties.options) {
            const value = getParameterValueByPath(nodeValues, propertyOptions.name, basePath.slice(0, -1));
            const valueArray = Array.isArray(value) ? value : [];
            const { minRequiredFields, maxAllowedFields } = nodeProperties.typeOptions ?? {};
            let error = '';
            if (minRequiredFields && valueArray.length < minRequiredFields) {
                error = `At least ${minRequiredFields} ${minRequiredFields === 1 ? 'field is' : 'fields are'} required.`;
            }
            if (maxAllowedFields && valueArray.length > maxAllowedFields) {
                error = `At most ${maxAllowedFields} ${maxAllowedFields === 1 ? 'field is' : 'fields are'} allowed.`;
            }
            if (error) {
                foundIssues.parameters ??= {};
                foundIssues.parameters[nodeProperties.name] ??= [];
                foundIssues.parameters[nodeProperties.name].push(error);
            }
            if (value === undefined) {
                continue;
            }
            if (nodeProperties.typeOptions !== undefined &&
                nodeProperties.typeOptions.multipleValues !== undefined) {
                if (Array.isArray(value)) {
                    for (let i = 0; i < value.length; i++) {
                        for (const option of propertyOptions.values) {
                            checkChildNodeProperties.push({
                                basePath: `${basePath}${propertyOptions.name}[${i}]`,
                                data: option,
                            });
                        }
                    }
                }
            }
            else {
                for (const option of propertyOptions.values) {
                    checkChildNodeProperties.push({
                        basePath: basePath + propertyOptions.name,
                        data: option,
                    });
                }
            }
        }
    }
    else {
        return foundIssues;
    }
    let propertyIssues;
    for (const optionData of checkChildNodeProperties) {
        propertyIssues = getParameterIssues(optionData.data, nodeValues, optionData.basePath, node);
        mergeIssues(foundIssues, propertyIssues);
    }
    return foundIssues;
}
function mergeIssues(destination, source) {
    if (source === null) {
        return;
    }
    if (source.execution === true) {
        destination.execution = true;
    }
    const objectProperties = ['parameters', 'credentials'];
    let destinationProperty;
    for (const propertyName of objectProperties) {
        if (source[propertyName] !== undefined) {
            if (destination[propertyName] === undefined) {
                destination[propertyName] = {};
            }
            let parameterName;
            for (parameterName of Object.keys(source[propertyName])) {
                destinationProperty = destination[propertyName];
                if (destinationProperty[parameterName] === undefined) {
                    destinationProperty[parameterName] = [];
                }
                destinationProperty[parameterName].push.apply(destinationProperty[parameterName], source[propertyName][parameterName]);
            }
        }
    }
    if (source.typeUnknown === true) {
        destination.typeUnknown = true;
    }
}
function mergeNodeProperties(mainProperties, addProperties) {
    let existingIndex;
    for (const property of addProperties) {
        if (property.doNotInherit)
            continue;
        existingIndex = mainProperties.findIndex((element) => element.name === property.name);
        if (existingIndex === -1) {
            mainProperties.push(property);
        }
        else {
            mainProperties[existingIndex] = property;
        }
    }
}
function getVersionedNodeType(object, version) {
    if ('nodeVersions' in object) {
        return object.getNodeType(version);
    }
    return object;
}
function isTriggerNode(nodeTypeData) {
    return nodeTypeData.group.includes('trigger');
}
function isExecutable(workflow, node, nodeTypeData) {
    const outputs = getNodeOutputs(workflow, node, nodeTypeData);
    const outputNames = getConnectionTypes(outputs);
    return outputNames.includes("main") || isTriggerNode(nodeTypeData);
}
//# sourceMappingURL=NodeHelpers.js.map