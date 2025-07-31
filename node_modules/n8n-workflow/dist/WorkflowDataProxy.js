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
exports.WorkflowDataProxy = void 0;
exports.isResourceLocatorValue = isResourceLocatorValue;
const jmespath = __importStar(require("jmespath"));
const luxon_1 = require("luxon");
const AugmentObject_1 = require("./AugmentObject");
const Constants_1 = require("./Constants");
const application_error_1 = require("./errors/application.error");
const expression_error_1 = require("./errors/expression.error");
const GlobalState_1 = require("./GlobalState");
const NodeHelpers = __importStar(require("./NodeHelpers"));
const utils_1 = require("./utils");
const WorkflowDataProxyEnvProvider_1 = require("./WorkflowDataProxyEnvProvider");
const WorkflowDataProxyHelpers_1 = require("./WorkflowDataProxyHelpers");
function isResourceLocatorValue(value) {
    return Boolean(typeof value === 'object' && value && 'mode' in value && 'value' in value && '__rl' in value);
}
const isScriptingNode = (nodeName, workflow) => {
    const node = workflow.getNode(nodeName);
    return node && Constants_1.SCRIPTING_NODE_TYPES.includes(node.type);
};
class WorkflowDataProxy {
    constructor(workflow, runExecutionData, runIndex, itemIndex, activeNodeName, connectionInputData, siblingParameters, mode, additionalKeys, executeData, defaultReturnRunIndex = -1, selfData = {}, contextNodeName = activeNodeName, envProviderState) {
        this.workflow = workflow;
        this.runIndex = runIndex;
        this.itemIndex = itemIndex;
        this.activeNodeName = activeNodeName;
        this.siblingParameters = siblingParameters;
        this.mode = mode;
        this.additionalKeys = additionalKeys;
        this.executeData = executeData;
        this.defaultReturnRunIndex = defaultReturnRunIndex;
        this.selfData = selfData;
        this.contextNodeName = contextNodeName;
        this.envProviderState = envProviderState;
        this.runExecutionData = isScriptingNode(this.contextNodeName, workflow)
            ? runExecutionData !== null
                ? (0, AugmentObject_1.augmentObject)(runExecutionData)
                : null
            : runExecutionData;
        this.connectionInputData = isScriptingNode(this.contextNodeName, workflow)
            ? (0, AugmentObject_1.augmentArray)(connectionInputData)
            : connectionInputData;
        this.timezone = workflow.settings?.timezone ?? (0, GlobalState_1.getGlobalState)().defaultTimezone;
        luxon_1.Settings.defaultZone = this.timezone;
    }
    nodeContextGetter(nodeName) {
        const that = this;
        const node = this.workflow.nodes[nodeName];
        if (!that.runExecutionData?.executionData && that.connectionInputData.length > 0) {
            return {};
        }
        if (!that.runExecutionData?.executionData && !that.runExecutionData?.resultData) {
            throw new expression_error_1.ExpressionError("The workflow hasn't been executed yet, so you can't reference any context data", {
                runIndex: that.runIndex,
                itemIndex: that.itemIndex,
                type: 'no_execution_data',
            });
        }
        return new Proxy({}, {
            has: () => true,
            ownKeys(target) {
                if (Reflect.ownKeys(target).length === 0) {
                    Object.assign(target, NodeHelpers.getContext(that.runExecutionData, 'node', node));
                }
                return Reflect.ownKeys(target);
            },
            getOwnPropertyDescriptor() {
                return {
                    enumerable: true,
                    configurable: true,
                };
            },
            get(_, name) {
                if (name === 'isProxy')
                    return true;
                name = name.toString();
                const contextData = NodeHelpers.getContext(that.runExecutionData, 'node', node);
                return contextData[name];
            },
        });
    }
    selfGetter() {
        const that = this;
        return new Proxy({}, {
            has: () => true,
            ownKeys(target) {
                return Reflect.ownKeys(target);
            },
            get(_, name) {
                if (name === 'isProxy')
                    return true;
                name = name.toString();
                return that.selfData[name];
            },
        });
    }
    nodeParameterGetter(nodeName, resolveValue = true) {
        const that = this;
        const node = this.workflow.nodes[nodeName];
        return new Proxy(node?.parameters ?? {}, {
            has: () => true,
            ownKeys(target) {
                return Reflect.ownKeys(target);
            },
            getOwnPropertyDescriptor() {
                return {
                    enumerable: true,
                    configurable: true,
                };
            },
            get(target, name) {
                if (name === 'isProxy')
                    return true;
                if (name === 'toJSON')
                    return () => (0, utils_1.deepCopy)(target);
                name = name.toString();
                let returnValue;
                if (name[0] === '&') {
                    const key = name.slice(1);
                    if (!that.siblingParameters.hasOwnProperty(key)) {
                        throw new application_error_1.ApplicationError('Could not find sibling parameter on node', {
                            extra: { nodeName, parameter: key },
                        });
                    }
                    returnValue = that.siblingParameters[key];
                }
                else {
                    if (!node.parameters.hasOwnProperty(name)) {
                        return undefined;
                    }
                    returnValue = node.parameters[name];
                }
                if (returnValue === `={{ $parameter.${name} }}`)
                    return undefined;
                if (isResourceLocatorValue(returnValue)) {
                    if (returnValue.__regex && typeof returnValue.value === 'string') {
                        const expr = new RegExp(returnValue.__regex);
                        const extracted = expr.exec(returnValue.value);
                        if (extracted && extracted.length >= 2) {
                            returnValue = extracted[1];
                        }
                        else {
                            return returnValue.value;
                        }
                    }
                    else {
                        returnValue = returnValue.value;
                    }
                }
                if (resolveValue && typeof returnValue === 'string' && returnValue.charAt(0) === '=') {
                    return that.workflow.expression.getParameterValue(returnValue, that.runExecutionData, that.runIndex, that.itemIndex, that.activeNodeName, that.connectionInputData, that.mode, that.additionalKeys, that.executeData, false, {}, that.contextNodeName);
                }
                return returnValue;
            },
        });
    }
    getNodeExecutionOrPinnedData({ nodeName, branchIndex, runIndex, shortSyntax = false, }) {
        try {
            return this.getNodeExecutionData(nodeName, shortSyntax, branchIndex, runIndex);
        }
        catch (e) {
            const pinData = (0, WorkflowDataProxyHelpers_1.getPinDataIfManualExecution)(this.workflow, nodeName, this.mode);
            if (pinData) {
                return pinData;
            }
            throw e;
        }
    }
    getNodeExecutionData(nodeName, shortSyntax = false, outputIndex, runIndex) {
        const that = this;
        let executionData;
        if (!shortSyntax) {
            if (that.runExecutionData === null) {
                throw new expression_error_1.ExpressionError("The workflow hasn't been executed yet, so you can't reference any output data", {
                    runIndex: that.runIndex,
                    itemIndex: that.itemIndex,
                });
            }
            if (!that.workflow.getNode(nodeName)) {
                throw new expression_error_1.ExpressionError("Referenced node doesn't exist", {
                    runIndex: that.runIndex,
                    itemIndex: that.itemIndex,
                    nodeCause: nodeName,
                    descriptionKey: 'nodeNotFound',
                });
            }
            if (!that.runExecutionData.resultData.runData.hasOwnProperty(nodeName) &&
                !(0, WorkflowDataProxyHelpers_1.getPinDataIfManualExecution)(that.workflow, nodeName, that.mode)) {
                throw new expression_error_1.ExpressionError('Referenced node is unexecuted', {
                    runIndex: that.runIndex,
                    itemIndex: that.itemIndex,
                    type: 'no_node_execution_data',
                    descriptionKey: 'noNodeExecutionData',
                    nodeCause: nodeName,
                });
            }
            runIndex = runIndex === undefined ? that.defaultReturnRunIndex : runIndex;
            runIndex =
                runIndex === -1 ? that.runExecutionData.resultData.runData[nodeName].length - 1 : runIndex;
            if (that.runExecutionData.resultData.runData[nodeName].length <= runIndex) {
                throw new expression_error_1.ExpressionError(`Run ${runIndex} of node "${nodeName}" not found`, {
                    runIndex: that.runIndex,
                    itemIndex: that.itemIndex,
                });
            }
            const taskData = that.runExecutionData.resultData.runData[nodeName][runIndex].data;
            if (!taskData.main?.length || taskData.main[0] === null) {
                throw new expression_error_1.ExpressionError('No data found from `main` input', {
                    runIndex: that.runIndex,
                    itemIndex: that.itemIndex,
                });
            }
            if (outputIndex === undefined) {
                const nodeConnection = that.workflow.getNodeConnectionIndexes(that.contextNodeName, nodeName, "main");
                if (nodeConnection === undefined) {
                    throw new expression_error_1.ExpressionError(`connect "${that.contextNodeName}" to "${nodeName}"`, {
                        runIndex: that.runIndex,
                        itemIndex: that.itemIndex,
                    });
                }
                outputIndex = nodeConnection.sourceIndex;
            }
            if (outputIndex === undefined) {
                outputIndex = 0;
            }
            if (taskData.main.length <= outputIndex) {
                throw new expression_error_1.ExpressionError(`Node "${nodeName}" has no branch with index ${outputIndex}.`, {
                    runIndex: that.runIndex,
                    itemIndex: that.itemIndex,
                });
            }
            executionData = taskData.main[outputIndex];
        }
        else {
            executionData = that.connectionInputData;
        }
        return executionData;
    }
    nodeDataGetter(nodeName, shortSyntax = false, throwOnMissingExecutionData = true) {
        const that = this;
        const node = this.workflow.nodes[nodeName];
        return new Proxy({ binary: undefined, data: undefined, json: undefined }, {
            has: () => true,
            get(target, name, receiver) {
                if (name === 'isProxy')
                    return true;
                name = name.toString();
                if (!node) {
                    throw new expression_error_1.ExpressionError("Referenced node doesn't exist", {
                        runIndex: that.runIndex,
                        itemIndex: that.itemIndex,
                        nodeCause: nodeName,
                        descriptionKey: 'nodeNotFound',
                    });
                }
                if (['binary', 'data', 'json'].includes(name)) {
                    const executionData = that.getNodeExecutionOrPinnedData({
                        nodeName,
                        shortSyntax,
                    });
                    if (executionData.length === 0 && !throwOnMissingExecutionData) {
                        return undefined;
                    }
                    if (executionData.length === 0) {
                        if (that.workflow.getParentNodes(nodeName).length === 0) {
                            throw new expression_error_1.ExpressionError('No execution data available', {
                                messageTemplate: 'No execution data available to expression under ‘%%PARAMETER%%’',
                                descriptionKey: 'noInputConnection',
                                nodeCause: nodeName,
                                runIndex: that.runIndex,
                                itemIndex: that.itemIndex,
                                type: 'no_input_connection',
                            });
                        }
                        throw new expression_error_1.ExpressionError('No execution data available', {
                            runIndex: that.runIndex,
                            itemIndex: that.itemIndex,
                            type: 'no_execution_data',
                        });
                    }
                    if (executionData.length <= that.itemIndex) {
                        throw new expression_error_1.ExpressionError(`No data found for item-index: "${that.itemIndex}"`, {
                            runIndex: that.runIndex,
                            itemIndex: that.itemIndex,
                        });
                    }
                    if (['data', 'json'].includes(name)) {
                        return executionData[that.itemIndex].json;
                    }
                    if (name === 'binary') {
                        const returnData = {};
                        if (!executionData[that.itemIndex].binary) {
                            return returnData;
                        }
                        const binaryKeyData = executionData[that.itemIndex].binary;
                        for (const keyName of Object.keys(binaryKeyData)) {
                            returnData[keyName] = {};
                            const binaryData = binaryKeyData[keyName];
                            for (const propertyName in binaryData) {
                                if (propertyName === 'data') {
                                    continue;
                                }
                                returnData[keyName][propertyName] = binaryData[propertyName];
                            }
                        }
                        return returnData;
                    }
                }
                else if (name === 'context') {
                    return that.nodeContextGetter(nodeName);
                }
                else if (name === 'parameter') {
                    return that.nodeParameterGetter(nodeName);
                }
                else if (name === 'runIndex') {
                    if (!that.runExecutionData?.resultData.runData[nodeName]) {
                        return -1;
                    }
                    return that.runExecutionData.resultData.runData[nodeName].length - 1;
                }
                return Reflect.get(target, name, receiver);
            },
        });
    }
    prevNodeGetter() {
        const allowedValues = ['name', 'outputIndex', 'runIndex'];
        const that = this;
        return new Proxy({}, {
            has: () => true,
            ownKeys() {
                return allowedValues;
            },
            getOwnPropertyDescriptor() {
                return {
                    enumerable: true,
                    configurable: true,
                };
            },
            get(target, name, receiver) {
                if (name === 'isProxy')
                    return true;
                if (!that.executeData?.source) {
                    return undefined;
                }
                const sourceData = that.executeData.source.main[0];
                if (name === 'name') {
                    return sourceData.previousNode;
                }
                if (name === 'outputIndex') {
                    return sourceData.previousNodeOutput || 0;
                }
                if (name === 'runIndex') {
                    return sourceData.previousNodeRun || 0;
                }
                return Reflect.get(target, name, receiver);
            },
        });
    }
    workflowGetter() {
        const allowedValues = ['active', 'id', 'name'];
        const that = this;
        return new Proxy({}, {
            has: () => true,
            ownKeys() {
                return allowedValues;
            },
            getOwnPropertyDescriptor() {
                return {
                    enumerable: true,
                    configurable: true,
                };
            },
            get(target, name, receiver) {
                if (name === 'isProxy')
                    return true;
                if (allowedValues.includes(name.toString())) {
                    const value = that.workflow[name];
                    if (value === undefined && name === 'id') {
                        throw new expression_error_1.ExpressionError('save workflow to view', {
                            description: 'Please save the workflow first to use $workflow',
                            runIndex: that.runIndex,
                            itemIndex: that.itemIndex,
                        });
                    }
                    return value;
                }
                return Reflect.get(target, name, receiver);
            },
        });
    }
    nodeGetter() {
        const that = this;
        return new Proxy({}, {
            has: () => true,
            get(_, name) {
                if (name === 'isProxy')
                    return true;
                const nodeName = name.toString();
                if (that.workflow.getNode(nodeName) === null) {
                    throw new expression_error_1.ExpressionError("Referenced node doesn't exist", {
                        runIndex: that.runIndex,
                        itemIndex: that.itemIndex,
                        nodeCause: nodeName,
                        descriptionKey: 'nodeNotFound',
                    });
                }
                return that.nodeDataGetter(nodeName);
            },
        });
    }
    getDataProxy(opts) {
        const that = this;
        const jmespathWrapper = (data, query) => {
            if (typeof data !== 'object' || typeof query !== 'string') {
                throw new expression_error_1.ExpressionError('expected two arguments (Object, string) for this function', {
                    runIndex: that.runIndex,
                    itemIndex: that.itemIndex,
                });
            }
            if (!Array.isArray(data) && typeof data === 'object') {
                return jmespath.search({ ...data }, query);
            }
            return jmespath.search(data, query);
        };
        const createExpressionError = (message, context) => {
            if (isScriptingNode(that.activeNodeName, that.workflow) && context?.functionOverrides) {
                message = context.functionOverrides.message || message;
                context.description = context.functionOverrides.description || context.description;
                context.messageTemplate = undefined;
            }
            if (context?.nodeCause) {
                const nodeName = context.nodeCause;
                const pinData = (0, WorkflowDataProxyHelpers_1.getPinDataIfManualExecution)(that.workflow, nodeName, that.mode);
                if (pinData) {
                    if (!context) {
                        context = {};
                    }
                    message = `Unpin '${nodeName}' to execute`;
                    context.messageTemplate = undefined;
                    context.descriptionKey = 'pairedItemPinned';
                }
                if (context.moreInfoLink && (pinData || isScriptingNode(nodeName, that.workflow))) {
                    const moreInfoLink = ' <a target="_blank" href="https://docs.n8n.io/data/data-mapping/data-item-linking/item-linking-errors/">More info</a>';
                    context.description += moreInfoLink;
                    if (context.descriptionTemplate)
                        context.descriptionTemplate += moreInfoLink;
                }
            }
            return new expression_error_1.ExpressionError(message, {
                runIndex: that.runIndex,
                itemIndex: that.itemIndex,
                ...context,
            });
        };
        const createInvalidPairedItemError = ({ nodeName }) => {
            return createExpressionError("Can't get data for expression", {
                messageTemplate: 'Expression info invalid',
                functionality: 'pairedItem',
                functionOverrides: {
                    message: "Can't get data",
                },
                nodeCause: nodeName,
                descriptionKey: 'pairedItemInvalidInfo',
                type: 'paired_item_invalid_info',
            });
        };
        const createMissingPairedItemError = (nodeCause, usedMethodName = 'pairedItem') => {
            const message = `Using the ${usedMethodName} method doesn't work with pinned data in this scenario. Please unpin '${nodeCause}' and try again.`;
            return new expression_error_1.ExpressionError(message, {
                runIndex: that.runIndex,
                itemIndex: that.itemIndex,
                functionality: 'pairedItem',
                descriptionKey: isScriptingNode(nodeCause, that.workflow)
                    ? 'pairedItemNoInfoCodeNode'
                    : 'pairedItemNoInfo',
                nodeCause,
                causeDetailed: `Missing pairedItem data (node '${nodeCause}' probably didn't supply it)`,
                type: 'paired_item_no_info',
            });
        };
        const createNoConnectionError = (nodeCause) => {
            return createExpressionError('Invalid expression', {
                messageTemplate: 'No path back to referenced node',
                functionality: 'pairedItem',
                descriptionKey: isScriptingNode(nodeCause, that.workflow)
                    ? 'pairedItemNoConnectionCodeNode'
                    : 'pairedItemNoConnection',
                type: 'paired_item_no_connection',
                moreInfoLink: true,
                nodeCause,
            });
        };
        const getPairedItem = (destinationNodeName, incomingSourceData, pairedItem, usedMethodName = '$getPairedItem') => {
            let taskData;
            let sourceData = incomingSourceData;
            if (pairedItem.sourceOverwrite) {
                sourceData = pairedItem.sourceOverwrite;
            }
            if (typeof pairedItem === 'number') {
                pairedItem = {
                    item: pairedItem,
                };
            }
            let currentPairedItem = pairedItem;
            let nodeBeforeLast;
            while (sourceData !== null && destinationNodeName !== sourceData.previousNode) {
                const runIndex = sourceData?.previousNodeRun || 0;
                const previousNodeOutput = sourceData.previousNodeOutput || 0;
                taskData =
                    that.runExecutionData?.resultData?.runData?.[sourceData.previousNode]?.[runIndex];
                if (taskData?.data?.main && previousNodeOutput >= taskData.data.main.length) {
                    throw createExpressionError('Can’t get data for expression', {
                        messageTemplate: 'Can’t get data for expression under ‘%%PARAMETER%%’ field',
                        functionOverrides: {
                            message: 'Can’t get data',
                        },
                        nodeCause: nodeBeforeLast,
                        description: 'Apologies, this is an internal error. See details for more information',
                        causeDetailed: 'Referencing a non-existent output on a node, problem with source data',
                        type: 'internal',
                    });
                }
                const previousNodeOutputData = taskData?.data?.main?.[previousNodeOutput] ??
                    (0, WorkflowDataProxyHelpers_1.getPinDataIfManualExecution)(that.workflow, sourceData.previousNode, that.mode) ??
                    [];
                const source = taskData?.source ?? [];
                if (pairedItem.item >= previousNodeOutputData.length) {
                    throw createInvalidPairedItemError({
                        nodeName: sourceData.previousNode,
                    });
                }
                const itemPreviousNode = previousNodeOutputData[pairedItem.item];
                if (itemPreviousNode.pairedItem === undefined) {
                    throw createMissingPairedItemError(sourceData.previousNode, usedMethodName);
                }
                if (Array.isArray(itemPreviousNode.pairedItem)) {
                    const results = itemPreviousNode.pairedItem
                        .map((item) => {
                        try {
                            const itemInput = item.input || 0;
                            if (itemInput >= source.length) {
                                throw new application_error_1.ApplicationError('Not found');
                            }
                            return getPairedItem(destinationNodeName, source[itemInput], item, usedMethodName);
                        }
                        catch (error) {
                            return null;
                        }
                    })
                        .filter((result) => result !== null);
                    if (results.length !== 1) {
                        const firstResult = results[0];
                        if (results.every((result) => result === firstResult)) {
                            return firstResult;
                        }
                        throw createExpressionError('Invalid expression', {
                            messageTemplate: `Multiple matching items for expression [item ${currentPairedItem.item || 0}]`,
                            functionality: 'pairedItem',
                            functionOverrides: {
                                message: `Multiple matching items for code [item ${currentPairedItem.item || 0}]`,
                            },
                            nodeCause: destinationNodeName,
                            descriptionKey: isScriptingNode(destinationNodeName, that.workflow)
                                ? 'pairedItemMultipleMatchesCodeNode'
                                : 'pairedItemMultipleMatches',
                            type: 'paired_item_multiple_matches',
                        });
                    }
                    return results[0];
                }
                currentPairedItem = pairedItem;
                if (typeof itemPreviousNode.pairedItem === 'number') {
                    pairedItem = {
                        item: itemPreviousNode.pairedItem,
                    };
                }
                else {
                    pairedItem = itemPreviousNode.pairedItem;
                }
                const itemInput = pairedItem.input || 0;
                if (itemInput >= source.length) {
                    if (source.length === 0) {
                        throw createNoConnectionError(destinationNodeName);
                    }
                    throw createExpressionError('Can’t get data for expression', {
                        messageTemplate: 'Can’t get data for expression under ‘%%PARAMETER%%’ field',
                        functionality: 'pairedItem',
                        functionOverrides: {
                            message: 'Can’t get data',
                        },
                        nodeCause: nodeBeforeLast,
                        description: `In node ‘<strong>${sourceData.previousNode}</strong>’, output item ${currentPairedItem.item || 0} of ${sourceData.previousNodeRun
                            ? `of run ${(sourceData.previousNodeRun || 0).toString()} `
                            : ''}points to a branch that doesn’t exist.`,
                        type: 'paired_item_invalid_info',
                    });
                }
                nodeBeforeLast = sourceData.previousNode;
                sourceData = source[pairedItem.input || 0] || null;
                if (pairedItem.sourceOverwrite) {
                    sourceData = pairedItem.sourceOverwrite;
                }
            }
            if (sourceData === null) {
                throw createExpressionError('Can’t get data for expression', {
                    messageTemplate: 'Can’t get data for expression under ‘%%PARAMETER%%’ field',
                    functionality: 'pairedItem',
                    functionOverrides: {
                        message: 'Can’t get data',
                    },
                    nodeCause: nodeBeforeLast,
                    description: 'Could not resolve, probably no pairedItem exists',
                    type: 'paired_item_no_info',
                    moreInfoLink: true,
                });
            }
            taskData =
                that.runExecutionData.resultData.runData[sourceData.previousNode]?.[sourceData?.previousNodeRun || 0];
            if (!taskData) {
                const pinData = (0, WorkflowDataProxyHelpers_1.getPinDataIfManualExecution)(that.workflow, sourceData.previousNode, that.mode);
                if (pinData) {
                    taskData = { data: { main: [pinData] }, startTime: 0, executionTime: 0, source: [] };
                }
            }
            const previousNodeOutput = sourceData.previousNodeOutput || 0;
            if (previousNodeOutput >= taskData.data.main.length) {
                throw createExpressionError('Can’t get data for expression', {
                    messageTemplate: 'Can’t get data for expression under ‘%%PARAMETER%%’ field',
                    functionality: 'pairedItem',
                    functionOverrides: {
                        message: 'Can’t get data',
                    },
                    nodeCause: sourceData.previousNode,
                    description: 'Item points to a node output which does not exist',
                    causeDetailed: `The sourceData points to a node output ‘${previousNodeOutput}‘ which does not exist on node ‘${sourceData.previousNode}‘ (output node did probably supply a wrong one)`,
                    type: 'paired_item_invalid_info',
                });
            }
            if (pairedItem.item >= taskData.data.main[previousNodeOutput].length) {
                throw createInvalidPairedItemError({
                    nodeName: sourceData.previousNode,
                });
            }
            return taskData.data.main[previousNodeOutput][pairedItem.item];
        };
        const handleFromAi = (name, _description, _type = 'string', defaultValue) => {
            const { itemIndex, runIndex } = that;
            if (!name || name === '') {
                throw new expression_error_1.ExpressionError("Add a key, e.g. $fromAI('placeholder_name')", {
                    runIndex,
                    itemIndex,
                });
            }
            const nameValidationRegex = /^[a-zA-Z0-9_-]{0,64}$/;
            if (!nameValidationRegex.test(name)) {
                throw new expression_error_1.ExpressionError('Invalid parameter key, must be between 1 and 64 characters long and only contain lowercase letters, uppercase letters, numbers, underscores, and hyphens', {
                    runIndex,
                    itemIndex,
                });
            }
            const inputData = that.runExecutionData?.resultData.runData[that.activeNodeName]?.[runIndex].inputOverride;
            const placeholdersDataInputData = inputData?.["ai_tool"]?.[0]?.[itemIndex].json;
            if (Boolean(!placeholdersDataInputData)) {
                throw new expression_error_1.ExpressionError('No execution data available', {
                    runIndex,
                    itemIndex,
                    type: 'no_execution_data',
                });
            }
            return (placeholdersDataInputData?.query?.[name] ??
                placeholdersDataInputData?.[name] ??
                defaultValue);
        };
        const base = {
            $: (nodeName) => {
                if (!nodeName) {
                    throw createExpressionError('When calling $(), please specify a node');
                }
                const referencedNode = that.workflow.getNode(nodeName);
                if (referencedNode === null) {
                    throw createExpressionError("Referenced node doesn't exist", {
                        runIndex: that.runIndex,
                        itemIndex: that.itemIndex,
                        nodeCause: nodeName,
                        descriptionKey: 'nodeNotFound',
                    });
                }
                const ensureNodeExecutionData = () => {
                    if (!that?.runExecutionData?.resultData?.runData.hasOwnProperty(nodeName) &&
                        !(0, WorkflowDataProxyHelpers_1.getPinDataIfManualExecution)(that.workflow, nodeName, that.mode)) {
                        throw createExpressionError('Referenced node is unexecuted', {
                            runIndex: that.runIndex,
                            itemIndex: that.itemIndex,
                            type: 'no_node_execution_data',
                            descriptionKey: 'noNodeExecutionData',
                            nodeCause: nodeName,
                        });
                    }
                };
                return new Proxy({}, {
                    has: () => true,
                    ownKeys() {
                        return [
                            'pairedItem',
                            'isExecuted',
                            'itemMatching',
                            'item',
                            'first',
                            'last',
                            'all',
                            'context',
                            'params',
                        ];
                    },
                    get(target, property, receiver) {
                        if (property === 'isProxy')
                            return true;
                        if (property === 'isExecuted') {
                            return (that?.runExecutionData?.resultData?.runData.hasOwnProperty(nodeName) ?? false);
                        }
                        if (property === 'pairedItem' || property === 'itemMatching' || property === 'item') {
                            const activeNode = that.workflow.getNode(that.activeNodeName);
                            let contextNode = that.contextNodeName;
                            if (activeNode) {
                                const parentMainInputNode = that.workflow.getParentMainInputNode(activeNode);
                                contextNode = parentMainInputNode.name ?? contextNode;
                            }
                            const parentNodes = that.workflow.getParentNodes(contextNode);
                            if (!parentNodes.includes(nodeName)) {
                                throw createNoConnectionError(nodeName);
                            }
                            ensureNodeExecutionData();
                            const pairedItemMethod = (itemIndex) => {
                                if (itemIndex === undefined) {
                                    if (property === 'itemMatching') {
                                        throw createExpressionError('Missing item index for .itemMatching()', {
                                            itemIndex,
                                        });
                                    }
                                    itemIndex = that.itemIndex;
                                }
                                if (!that.connectionInputData.length) {
                                    const pinnedData = (0, WorkflowDataProxyHelpers_1.getPinDataIfManualExecution)(that.workflow, nodeName, that.mode);
                                    if (pinnedData) {
                                        return pinnedData[itemIndex];
                                    }
                                }
                                const executionData = that.connectionInputData;
                                const input = executionData?.[itemIndex];
                                if (!input) {
                                    throw createExpressionError('Can’t get data for expression', {
                                        messageTemplate: 'Can’t get data for expression under ‘%%PARAMETER%%’ field',
                                        functionality: 'pairedItem',
                                        functionOverrides: {
                                            description: `Some intermediate nodes between ‘<strong>${nodeName}</strong>‘ and  ‘<strong>${that.activeNodeName}</strong>‘ have not executed yet.`,
                                            message: 'Can’t get data',
                                        },
                                        description: `Some intermediate nodes between ‘<strong>${nodeName}</strong>‘ and  ‘<strong>${that.activeNodeName}</strong>‘ have not executed yet.`,
                                        causeDetailed: `pairedItem can\'t be found when intermediate nodes between ‘<strong>${nodeName}</strong>‘ and  ‘<strong>${that.activeNodeName}</strong> have not executed yet.`,
                                        itemIndex,
                                        type: 'paired_item_intermediate_nodes',
                                    });
                                }
                                const pairedItem = input.pairedItem;
                                if (pairedItem === undefined) {
                                    throw createMissingPairedItemError(that.activeNodeName, property);
                                }
                                if (!that.executeData?.source) {
                                    throw createExpressionError('Can’t get data for expression', {
                                        messageTemplate: 'Can’t get data for expression under ‘%%PARAMETER%%’ field',
                                        functionality: 'pairedItem',
                                        functionOverrides: {
                                            message: 'Can’t get data',
                                        },
                                        description: 'Apologies, this is an internal error. See details for more information',
                                        causeDetailed: 'Missing sourceData (probably an internal error)',
                                        itemIndex,
                                    });
                                }
                                const sourceData = that.executeData.source.main[pairedItem.input || 0] ??
                                    that.executeData.source.main[0];
                                return getPairedItem(nodeName, sourceData, pairedItem, property);
                            };
                            if (property === 'item') {
                                return pairedItemMethod();
                            }
                            return pairedItemMethod;
                        }
                        if (property === 'first') {
                            ensureNodeExecutionData();
                            return (branchIndex, runIndex) => {
                                branchIndex =
                                    branchIndex ??
                                        that.workflow.getNodeConnectionIndexes(that.activeNodeName, nodeName)
                                            ?.sourceIndex ??
                                        0;
                                const executionData = that.getNodeExecutionOrPinnedData({
                                    nodeName,
                                    branchIndex,
                                    runIndex,
                                });
                                if (executionData[0])
                                    return executionData[0];
                                return undefined;
                            };
                        }
                        if (property === 'last') {
                            ensureNodeExecutionData();
                            return (branchIndex, runIndex) => {
                                branchIndex =
                                    branchIndex ??
                                        that.workflow.getNodeConnectionIndexes(that.activeNodeName, nodeName)
                                            ?.sourceIndex ??
                                        0;
                                const executionData = that.getNodeExecutionOrPinnedData({
                                    nodeName,
                                    branchIndex,
                                    runIndex,
                                });
                                if (!executionData.length)
                                    return undefined;
                                if (executionData[executionData.length - 1]) {
                                    return executionData[executionData.length - 1];
                                }
                                return undefined;
                            };
                        }
                        if (property === 'all') {
                            ensureNodeExecutionData();
                            return (branchIndex, runIndex) => {
                                branchIndex =
                                    branchIndex ??
                                        that.workflow.getNodeConnectionIndexes(that.activeNodeName, nodeName)
                                            ?.sourceIndex ??
                                        0;
                                return that.getNodeExecutionOrPinnedData({ nodeName, branchIndex, runIndex });
                            };
                        }
                        if (property === 'context') {
                            return that.nodeContextGetter(nodeName);
                        }
                        if (property === 'params') {
                            return that.workflow.getNode(nodeName)?.parameters;
                        }
                        return Reflect.get(target, property, receiver);
                    },
                });
            },
            $input: new Proxy({}, {
                has: () => true,
                ownKeys() {
                    return ['all', 'context', 'first', 'item', 'last', 'params'];
                },
                getOwnPropertyDescriptor() {
                    return {
                        enumerable: true,
                        configurable: true,
                    };
                },
                get(target, property, receiver) {
                    if (property === 'isProxy')
                        return true;
                    if (that.connectionInputData.length === 0) {
                        throw createExpressionError('No execution data available', {
                            runIndex: that.runIndex,
                            itemIndex: that.itemIndex,
                            type: 'no_execution_data',
                        });
                    }
                    if (property === 'item') {
                        return that.connectionInputData[that.itemIndex];
                    }
                    if (property === 'first') {
                        return (...args) => {
                            if (args.length) {
                                throw createExpressionError('$input.first() should have no arguments');
                            }
                            const result = that.connectionInputData;
                            if (result[0]) {
                                return result[0];
                            }
                            return undefined;
                        };
                    }
                    if (property === 'last') {
                        return (...args) => {
                            if (args.length) {
                                throw createExpressionError('$input.last() should have no arguments');
                            }
                            const result = that.connectionInputData;
                            if (result.length && result[result.length - 1]) {
                                return result[result.length - 1];
                            }
                            return undefined;
                        };
                    }
                    if (property === 'all') {
                        return () => {
                            const result = that.connectionInputData;
                            if (result.length) {
                                return result;
                            }
                            return [];
                        };
                    }
                    if (['context', 'params'].includes(property)) {
                        if (!that.executeData?.source) {
                            throw createExpressionError('Can’t get data for expression', {
                                messageTemplate: 'Can’t get data for expression under ‘%%PARAMETER%%’ field',
                                functionOverrides: {
                                    message: 'Can’t get data',
                                },
                                description: 'Apologies, this is an internal error. See details for more information',
                                causeDetailed: 'Missing sourceData (probably an internal error)',
                                runIndex: that.runIndex,
                            });
                        }
                        const sourceData = that.executeData.source.main[0];
                        if (property === 'context') {
                            return that.nodeContextGetter(sourceData.previousNode);
                        }
                        if (property === 'params') {
                            return that.workflow.getNode(sourceData.previousNode)?.parameters;
                        }
                    }
                    return Reflect.get(target, property, receiver);
                },
            }),
            $binary: {},
            $data: {},
            $env: (0, WorkflowDataProxyEnvProvider_1.createEnvProvider)(that.runIndex, that.itemIndex, that.envProviderState ?? (0, WorkflowDataProxyEnvProvider_1.createEnvProviderState)()),
            $evaluateExpression: (expression, itemIndex) => {
                itemIndex = itemIndex || that.itemIndex;
                return that.workflow.expression.getParameterValue(`=${expression}`, that.runExecutionData, that.runIndex, itemIndex, that.activeNodeName, that.connectionInputData, that.mode, that.additionalKeys, that.executeData, false, {}, that.contextNodeName);
            },
            $item: (itemIndex, runIndex) => {
                const defaultReturnRunIndex = runIndex === undefined ? -1 : runIndex;
                const dataProxy = new WorkflowDataProxy(this.workflow, this.runExecutionData, this.runIndex, itemIndex, this.activeNodeName, this.connectionInputData, that.siblingParameters, that.mode, that.additionalKeys, that.executeData, defaultReturnRunIndex, {}, that.contextNodeName);
                return dataProxy.getDataProxy();
            },
            $fromAI: handleFromAi,
            $fromai: handleFromAi,
            $fromAi: handleFromAi,
            $items: (nodeName, outputIndex, runIndex) => {
                if (nodeName === undefined) {
                    nodeName = that.prevNodeGetter().name;
                    const node = this.workflow.nodes[nodeName];
                    let result = that.connectionInputData;
                    if (node.executeOnce === true) {
                        result = result.slice(0, 1);
                    }
                    if (result.length) {
                        return result;
                    }
                    return [];
                }
                outputIndex = outputIndex || 0;
                runIndex = runIndex === undefined ? -1 : runIndex;
                return that.getNodeExecutionData(nodeName, false, outputIndex, runIndex);
            },
            $json: {},
            $node: this.nodeGetter(),
            $self: this.selfGetter(),
            $parameter: this.nodeParameterGetter(this.activeNodeName),
            $rawParameter: this.nodeParameterGetter(this.activeNodeName, false),
            $prevNode: this.prevNodeGetter(),
            $runIndex: this.runIndex,
            $mode: this.mode,
            $workflow: this.workflowGetter(),
            $itemIndex: this.itemIndex,
            $now: luxon_1.DateTime.now(),
            $today: luxon_1.DateTime.now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
            $jmesPath: jmespathWrapper,
            DateTime: luxon_1.DateTime,
            Interval: luxon_1.Interval,
            Duration: luxon_1.Duration,
            ...that.additionalKeys,
            $getPairedItem: getPairedItem,
            $jmespath: jmespathWrapper,
            $position: this.itemIndex,
            $thisItem: that.connectionInputData[that.itemIndex],
            $thisItemIndex: this.itemIndex,
            $thisRunIndex: this.runIndex,
            $nodeVersion: that.workflow.getNode(that.activeNodeName)?.typeVersion,
            $nodeId: that.workflow.getNode(that.activeNodeName)?.id,
            $webhookId: that.workflow.getNode(that.activeNodeName)?.webhookId,
        };
        const throwOnMissingExecutionData = opts?.throwOnMissingExecutionData ?? true;
        return new Proxy(base, {
            has: () => true,
            get(target, name, receiver) {
                if (name === 'isProxy')
                    return true;
                if (['$data', '$json'].includes(name)) {
                    return that.nodeDataGetter(that.contextNodeName, true, throwOnMissingExecutionData)?.json;
                }
                if (name === '$binary') {
                    return that.nodeDataGetter(that.contextNodeName, true, throwOnMissingExecutionData)
                        ?.binary;
                }
                return Reflect.get(target, name, receiver);
            },
        });
    }
}
exports.WorkflowDataProxy = WorkflowDataProxy;
//# sourceMappingURL=WorkflowDataProxy.js.map