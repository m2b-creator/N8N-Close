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
exports.Workflow = void 0;
const Constants_1 = require("./Constants");
const application_error_1 = require("./errors/application.error");
const Expression_1 = require("./Expression");
const GlobalState_1 = require("./GlobalState");
const NodeHelpers = __importStar(require("./NodeHelpers"));
const ObservableObject = __importStar(require("./ObservableObject"));
function dedupe(arr) {
    return [...new Set(arr)];
}
class Workflow {
    constructor(parameters) {
        this.nodes = {};
        this.id = parameters.id;
        this.name = parameters.name;
        this.nodeTypes = parameters.nodeTypes;
        this.pinData = parameters.pinData;
        let nodeType;
        for (const node of parameters.nodes) {
            this.nodes[node.name] = node;
            nodeType = this.nodeTypes.getByNameAndVersion(node.type, node.typeVersion);
            if (nodeType === undefined) {
                continue;
            }
            const nodeParameters = NodeHelpers.getNodeParameters(nodeType.description.properties, node.parameters, true, false, node);
            node.parameters = nodeParameters !== null ? nodeParameters : {};
        }
        this.connectionsBySourceNode = parameters.connections;
        this.connectionsByDestinationNode = Workflow.getConnectionsByDestination(parameters.connections);
        this.active = parameters.active || false;
        this.staticData = ObservableObject.create(parameters.staticData || {}, undefined, {
            ignoreEmptyOnFirstChild: true,
        });
        this.settings = parameters.settings || {};
        this.timezone = this.settings.timezone ?? (0, GlobalState_1.getGlobalState)().defaultTimezone;
        this.expression = new Expression_1.Expression(this);
    }
    overrideStaticData(staticData) {
        this.staticData = ObservableObject.create(staticData || {}, undefined, {
            ignoreEmptyOnFirstChild: true,
        });
        this.staticData.__dataChanged = true;
    }
    static getConnectionsByDestination(connections) {
        const returnConnection = {};
        let connectionInfo;
        let maxIndex;
        for (const sourceNode in connections) {
            if (!connections.hasOwnProperty(sourceNode)) {
                continue;
            }
            for (const type of Object.keys(connections[sourceNode])) {
                if (!connections[sourceNode].hasOwnProperty(type)) {
                    continue;
                }
                for (const inputIndex in connections[sourceNode][type]) {
                    if (!connections[sourceNode][type].hasOwnProperty(inputIndex)) {
                        continue;
                    }
                    for (connectionInfo of connections[sourceNode][type][inputIndex] ?? []) {
                        if (!returnConnection.hasOwnProperty(connectionInfo.node)) {
                            returnConnection[connectionInfo.node] = {};
                        }
                        if (!returnConnection[connectionInfo.node].hasOwnProperty(connectionInfo.type)) {
                            returnConnection[connectionInfo.node][connectionInfo.type] = [];
                        }
                        maxIndex = returnConnection[connectionInfo.node][connectionInfo.type].length - 1;
                        for (let j = maxIndex; j < connectionInfo.index; j++) {
                            returnConnection[connectionInfo.node][connectionInfo.type].push([]);
                        }
                        returnConnection[connectionInfo.node][connectionInfo.type][connectionInfo.index]?.push({
                            node: sourceNode,
                            type,
                            index: parseInt(inputIndex, 10),
                        });
                    }
                }
            }
        }
        return returnConnection;
    }
    getStaticData(type, node) {
        let key;
        if (type === 'global') {
            key = 'global';
        }
        else if (type === 'node') {
            if (node === undefined) {
                throw new application_error_1.ApplicationError('The request data of context type "node" the node parameter has to be set!');
            }
            key = `node:${node.name}`;
        }
        else {
            throw new application_error_1.ApplicationError('Unknown context type. Only `global` and `node` are supported.', {
                extra: { contextType: type },
            });
        }
        if (this.testStaticData?.[key])
            return this.testStaticData[key];
        if (this.staticData[key] === undefined) {
            this.staticData[key] = ObservableObject.create({}, this.staticData);
        }
        return this.staticData[key];
    }
    setTestStaticData(testStaticData) {
        this.testStaticData = testStaticData;
    }
    getTriggerNodes() {
        return this.queryNodes((nodeType) => !!nodeType.trigger);
    }
    getPollNodes() {
        return this.queryNodes((nodeType) => !!nodeType.poll);
    }
    queryNodes(checkFunction) {
        const returnNodes = [];
        let node;
        let nodeType;
        for (const nodeName of Object.keys(this.nodes)) {
            node = this.nodes[nodeName];
            if (node.disabled === true) {
                continue;
            }
            nodeType = this.nodeTypes.getByNameAndVersion(node.type, node.typeVersion);
            if (nodeType !== undefined && checkFunction(nodeType)) {
                returnNodes.push(node);
            }
        }
        return returnNodes;
    }
    getNode(nodeName) {
        if (this.nodes.hasOwnProperty(nodeName)) {
            return this.nodes[nodeName];
        }
        return null;
    }
    getNodes(nodeNames) {
        const nodes = [];
        for (const name of nodeNames) {
            const node = this.getNode(name);
            if (!node) {
                console.warn(`Could not find a node with the name ${name} in the workflow. This was passed in as a dirty node name.`);
                continue;
            }
            nodes.push(node);
        }
        return nodes;
    }
    getPinDataOfNode(nodeName) {
        return this.pinData ? this.pinData[nodeName] : undefined;
    }
    renameNodeInParameterValue(parameterValue, currentName, newName, { hasRenamableContent } = { hasRenamableContent: false }) {
        if (typeof parameterValue !== 'object') {
            if (typeof parameterValue === 'string' &&
                (parameterValue.charAt(0) === '=' || hasRenamableContent)) {
                if (parameterValue.includes(currentName)) {
                    const escapedOldName = backslashEscape(currentName);
                    const escapedNewName = dollarEscape(newName);
                    const setNewName = (expression, oldPattern) => expression.replace(new RegExp(oldPattern, 'g'), `$1${escapedNewName}$2`);
                    if (parameterValue.includes('$(')) {
                        const oldPattern = String.raw `(\$\(['"])${escapedOldName}(['"]\))`;
                        parameterValue = setNewName(parameterValue, oldPattern);
                    }
                    if (parameterValue.includes('$node[')) {
                        const oldPattern = String.raw `(\$node\[['"])${escapedOldName}(['"]\])`;
                        parameterValue = setNewName(parameterValue, oldPattern);
                    }
                    if (parameterValue.includes('$node.')) {
                        const oldPattern = String.raw `(\$node\.)${escapedOldName}(\.?)`;
                        parameterValue = setNewName(parameterValue, oldPattern);
                        if (hasDotNotationBannedChar(newName)) {
                            const regex = new RegExp(`.${backslashEscape(newName)}( |\\.)`, 'g');
                            parameterValue = parameterValue.replace(regex, `["${escapedNewName}"]$1`);
                        }
                    }
                    if (parameterValue.includes('$items(')) {
                        const oldPattern = String.raw `(\$items\(['"])${escapedOldName}(['"],|['"]\))`;
                        parameterValue = setNewName(parameterValue, oldPattern);
                    }
                }
            }
            return parameterValue;
        }
        if (Array.isArray(parameterValue)) {
            const returnArray = [];
            for (const currentValue of parameterValue) {
                returnArray.push(this.renameNodeInParameterValue(currentValue, currentName, newName));
            }
            return returnArray;
        }
        const returnData = {};
        for (const parameterName of Object.keys(parameterValue || {})) {
            returnData[parameterName] = this.renameNodeInParameterValue(parameterValue[parameterName], currentName, newName, { hasRenamableContent });
        }
        return returnData;
    }
    renameNode(currentName, newName) {
        if (this.nodes[currentName] !== undefined) {
            this.nodes[newName] = this.nodes[currentName];
            this.nodes[newName].name = newName;
            delete this.nodes[currentName];
        }
        for (const node of Object.values(this.nodes)) {
            node.parameters = this.renameNodeInParameterValue(node.parameters, currentName, newName);
            if (Constants_1.NODES_WITH_RENAMABLE_CONTENT.has(node.type)) {
                node.parameters.jsCode = this.renameNodeInParameterValue(node.parameters.jsCode, currentName, newName, { hasRenamableContent: true });
            }
        }
        if (this.connectionsBySourceNode.hasOwnProperty(currentName)) {
            this.connectionsBySourceNode[newName] = this.connectionsBySourceNode[currentName];
            delete this.connectionsBySourceNode[currentName];
        }
        let sourceNode;
        let type;
        let sourceIndex;
        let connectionIndex;
        let connectionData;
        for (sourceNode of Object.keys(this.connectionsBySourceNode)) {
            for (type of Object.keys(this.connectionsBySourceNode[sourceNode])) {
                for (sourceIndex of Object.keys(this.connectionsBySourceNode[sourceNode][type])) {
                    for (connectionIndex of Object.keys(this.connectionsBySourceNode[sourceNode][type][parseInt(sourceIndex, 10)] || [])) {
                        connectionData =
                            this.connectionsBySourceNode[sourceNode][type][parseInt(sourceIndex, 10)]?.[parseInt(connectionIndex, 10)];
                        if (connectionData?.node === currentName) {
                            connectionData.node = newName;
                        }
                    }
                }
            }
        }
        this.connectionsByDestinationNode = Workflow.getConnectionsByDestination(this.connectionsBySourceNode);
    }
    getHighestNode(nodeName, nodeConnectionIndex, checkedNodes) {
        const currentHighest = [];
        if (this.nodes[nodeName].disabled === false) {
            currentHighest.push(nodeName);
        }
        if (!this.connectionsByDestinationNode.hasOwnProperty(nodeName)) {
            return currentHighest;
        }
        if (!this.connectionsByDestinationNode[nodeName].hasOwnProperty("main")) {
            return currentHighest;
        }
        checkedNodes = checkedNodes || [];
        if (checkedNodes.includes(nodeName)) {
            return currentHighest;
        }
        checkedNodes.push(nodeName);
        const returnNodes = [];
        let addNodes;
        let connectionsByIndex;
        for (let connectionIndex = 0; connectionIndex < this.connectionsByDestinationNode[nodeName]["main"].length; connectionIndex++) {
            if (nodeConnectionIndex !== undefined && nodeConnectionIndex !== connectionIndex) {
                continue;
            }
            connectionsByIndex =
                this.connectionsByDestinationNode[nodeName]["main"][connectionIndex];
            connectionsByIndex?.forEach((connection) => {
                if (checkedNodes.includes(connection.node)) {
                    return;
                }
                if (!(connection.node in this.nodes))
                    return;
                addNodes = this.getHighestNode(connection.node, undefined, checkedNodes);
                if (addNodes.length === 0) {
                    if (this.nodes[connection.node].disabled !== true) {
                        addNodes = [connection.node];
                    }
                }
                addNodes.forEach((name) => {
                    if (returnNodes.indexOf(name) === -1) {
                        returnNodes.push(name);
                    }
                });
            });
        }
        return returnNodes;
    }
    getChildNodes(nodeName, type = "main", depth = -1) {
        return this.getConnectedNodes(this.connectionsBySourceNode, nodeName, type, depth);
    }
    getParentNodes(nodeName, type = "main", depth = -1) {
        return this.getConnectedNodes(this.connectionsByDestinationNode, nodeName, type, depth);
    }
    getConnectedNodes(connections, nodeName, connectionType = "main", depth = -1, checkedNodesIncoming) {
        depth = depth === -1 ? -1 : depth;
        const newDepth = depth === -1 ? depth : depth - 1;
        if (depth === 0) {
            return [];
        }
        if (!connections.hasOwnProperty(nodeName)) {
            return [];
        }
        let types;
        if (connectionType === 'ALL') {
            types = Object.keys(connections[nodeName]);
        }
        else if (connectionType === 'ALL_NON_MAIN') {
            types = Object.keys(connections[nodeName]).filter((type) => type !== 'main');
        }
        else {
            types = [connectionType];
        }
        let addNodes;
        let nodeIndex;
        let i;
        let parentNodeName;
        const returnNodes = [];
        types.forEach((type) => {
            if (!connections[nodeName].hasOwnProperty(type)) {
                return;
            }
            const checkedNodes = checkedNodesIncoming ? [...checkedNodesIncoming] : [];
            if (checkedNodes.includes(nodeName)) {
                return;
            }
            checkedNodes.push(nodeName);
            connections[nodeName][type].forEach((connectionsByIndex) => {
                connectionsByIndex?.forEach((connection) => {
                    if (checkedNodes.includes(connection.node)) {
                        return;
                    }
                    returnNodes.unshift(connection.node);
                    addNodes = this.getConnectedNodes(connections, connection.node, connectionType, newDepth, checkedNodes);
                    for (i = addNodes.length; i--; i > 0) {
                        parentNodeName = addNodes[i];
                        nodeIndex = returnNodes.indexOf(parentNodeName);
                        if (nodeIndex !== -1) {
                            returnNodes.splice(nodeIndex, 1);
                        }
                        returnNodes.unshift(parentNodeName);
                    }
                });
            });
        });
        return returnNodes;
    }
    getParentNodesByDepth(nodeName, maxDepth = -1) {
        return this.searchNodesBFS(this.connectionsByDestinationNode, nodeName, maxDepth);
    }
    searchNodesBFS(connections, sourceNode, maxDepth = -1) {
        const returnConns = [];
        const type = "main";
        let queue = [];
        queue.push({
            name: sourceNode,
            depth: 0,
            indicies: [],
        });
        const visited = {};
        let depth = 0;
        while (queue.length > 0) {
            if (maxDepth !== -1 && depth > maxDepth) {
                break;
            }
            depth++;
            const toAdd = [...queue];
            queue = [];
            toAdd.forEach((curr) => {
                if (visited[curr.name]) {
                    visited[curr.name].indicies = dedupe(visited[curr.name].indicies.concat(curr.indicies));
                    return;
                }
                visited[curr.name] = curr;
                if (curr.name !== sourceNode) {
                    returnConns.push(curr);
                }
                if (!connections.hasOwnProperty(curr.name) ||
                    !connections[curr.name].hasOwnProperty(type)) {
                    return;
                }
                connections[curr.name][type].forEach((connectionsByIndex) => {
                    connectionsByIndex?.forEach((connection) => {
                        queue.push({
                            name: connection.node,
                            indicies: [connection.index],
                            depth,
                        });
                    });
                });
            });
        }
        return returnConns;
    }
    getParentMainInputNode(node) {
        if (node) {
            const nodeType = this.nodeTypes.getByNameAndVersion(node.type, node.typeVersion);
            const outputs = NodeHelpers.getNodeOutputs(this, node, nodeType.description);
            if (!!outputs.find((output) => (output?.type ?? output) !== "main")) {
                const nonMainNodesConnected = outputs?.reduce((acc, outputName) => {
                    const parentNodes = this.getChildNodes(node.name, outputName?.type ?? outputName);
                    if (parentNodes.length > 0) {
                        acc.push(...parentNodes);
                    }
                    return acc;
                }, []);
                if (nonMainNodesConnected.length) {
                    const returnNode = this.getNode(nonMainNodesConnected[0]);
                    if (returnNode === null) {
                        throw new application_error_1.ApplicationError(`Node "${nonMainNodesConnected[0]}" not found`);
                    }
                    return this.getParentMainInputNode(returnNode);
                }
            }
        }
        return node;
    }
    getNodeConnectionIndexes(nodeName, parentNodeName, type = "main", depth = -1, checkedNodes) {
        const node = this.getNode(parentNodeName);
        if (node === null) {
            return undefined;
        }
        depth = depth === -1 ? -1 : depth;
        const newDepth = depth === -1 ? depth : depth - 1;
        if (depth === 0) {
            return undefined;
        }
        if (!this.connectionsByDestinationNode.hasOwnProperty(nodeName)) {
            return undefined;
        }
        if (!this.connectionsByDestinationNode[nodeName].hasOwnProperty(type)) {
            return undefined;
        }
        checkedNodes = checkedNodes || [];
        if (checkedNodes.includes(nodeName)) {
            return undefined;
        }
        checkedNodes.push(nodeName);
        let outputIndex;
        for (const connectionsByIndex of this.connectionsByDestinationNode[nodeName][type]) {
            if (!connectionsByIndex) {
                continue;
            }
            for (let destinationIndex = 0; destinationIndex < connectionsByIndex.length; destinationIndex++) {
                const connection = connectionsByIndex[destinationIndex];
                if (parentNodeName === connection.node) {
                    return {
                        sourceIndex: connection.index,
                        destinationIndex,
                    };
                }
                if (checkedNodes.includes(connection.node)) {
                    continue;
                }
                outputIndex = this.getNodeConnectionIndexes(connection.node, parentNodeName, type, newDepth, checkedNodes);
                if (outputIndex !== undefined) {
                    return outputIndex;
                }
            }
        }
        return undefined;
    }
    __getStartNode(nodeNames) {
        let node;
        let nodeType;
        for (const nodeName of nodeNames) {
            node = this.nodes[nodeName];
            if (nodeNames.length === 1 && !node.disabled) {
                return node;
            }
            nodeType = this.nodeTypes.getByNameAndVersion(node.type, node.typeVersion);
            if (nodeType.description.name === Constants_1.MANUAL_CHAT_TRIGGER_LANGCHAIN_NODE_TYPE) {
                continue;
            }
            if (nodeType && (nodeType.trigger !== undefined || nodeType.poll !== undefined)) {
                if (node.disabled === true) {
                    continue;
                }
                return node;
            }
        }
        const sortedNodeNames = Object.values(this.nodes)
            .sort((a, b) => Constants_1.STARTING_NODE_TYPES.indexOf(a.type) - Constants_1.STARTING_NODE_TYPES.indexOf(b.type))
            .map((n) => n.name);
        for (const nodeName of sortedNodeNames) {
            node = this.nodes[nodeName];
            if (Constants_1.STARTING_NODE_TYPES.includes(node.type)) {
                if (node.disabled === true) {
                    continue;
                }
                return node;
            }
        }
        return undefined;
    }
    getStartNode(destinationNode) {
        if (destinationNode) {
            const nodeNames = this.getHighestNode(destinationNode);
            if (nodeNames.length === 0) {
                nodeNames.push(destinationNode);
            }
            const node = this.__getStartNode(nodeNames);
            if (node !== undefined) {
                return node;
            }
            return this.nodes[nodeNames[0]];
        }
        return this.__getStartNode(Object.keys(this.nodes));
    }
}
exports.Workflow = Workflow;
function hasDotNotationBannedChar(nodeName) {
    const DOT_NOTATION_BANNED_CHARS = /^(\d)|[\\ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>?~]/g;
    return DOT_NOTATION_BANNED_CHARS.test(nodeName);
}
function backslashEscape(nodeName) {
    const BACKSLASH_ESCAPABLE_CHARS = /[.*+?^${}()|[\]\\]/g;
    return nodeName.replace(BACKSLASH_ESCAPABLE_CHARS, (char) => `\\${char}`);
}
function dollarEscape(nodeName) {
    return nodeName.replace(new RegExp('\\$', 'g'), '$$$$');
}
//# sourceMappingURL=Workflow.js.map