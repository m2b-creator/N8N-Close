"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userInInstanceRanOutOfFreeAiCredits = exports.ANONYMIZATION_CHARACTER = void 0;
exports.getNodeTypeForName = getNodeTypeForName;
exports.isNumber = isNumber;
exports.getDomainBase = getDomainBase;
exports.getDomainPath = getDomainPath;
exports.generateNodesGraph = generateNodesGraph;
exports.extractLastExecutedNodeCredentialData = extractLastExecutedNodeCredentialData;
exports.resolveAIMetrics = resolveAIMetrics;
const Constants_1 = require("./Constants");
const application_error_1 = require("./errors/application.error");
const NodeHelpers_1 = require("./NodeHelpers");
const utils_1 = require("./utils");
const isNodeApiError = (error) => typeof error === 'object' && error !== null && 'name' in error && error?.name === 'NodeApiError';
function getNodeTypeForName(workflow, nodeName) {
    return workflow.nodes.find((node) => node.name === nodeName);
}
function isNumber(value) {
    return typeof value === 'number';
}
const countPlaceholders = (text) => {
    const placeholder = /(\{[a-zA-Z0-9_]+\})/g;
    let returnData = 0;
    try {
        const matches = text.matchAll(placeholder);
        for (const _ of matches)
            returnData++;
    }
    catch (error) { }
    return returnData;
};
const countPlaceholdersInParameters = (parameters) => {
    let returnData = 0;
    for (const parameter of parameters) {
        if (!parameter.value) {
            returnData++;
        }
        else {
            returnData += countPlaceholders(String(parameter.value));
        }
    }
    return returnData;
};
function areOverlapping(topLeft, bottomRight, targetPos) {
    return (targetPos[0] > topLeft[0] &&
        targetPos[1] > topLeft[1] &&
        targetPos[0] < bottomRight[0] &&
        targetPos[1] < bottomRight[1]);
}
const URL_PARTS_REGEX = /(?<protocolPlusDomain>.*?\..*?)(?<pathname>\/.*)/;
function getDomainBase(raw, urlParts = URL_PARTS_REGEX) {
    try {
        const url = new URL(raw);
        return [url.protocol, url.hostname].join('//');
    }
    catch {
        const match = urlParts.exec(raw);
        if (!match?.groups?.protocolPlusDomain)
            return '';
        return match.groups.protocolPlusDomain;
    }
}
function isSensitive(segment) {
    if (/^v\d+$/.test(segment))
        return false;
    return /%40/.test(segment) || /\d/.test(segment) || /^[0-9A-F]{8}/i.test(segment);
}
exports.ANONYMIZATION_CHARACTER = '*';
function sanitizeRoute(raw, check = isSensitive, char = exports.ANONYMIZATION_CHARACTER) {
    return raw
        .split('/')
        .map((segment) => (check(segment) ? char.repeat(segment.length) : segment))
        .join('/');
}
function getDomainPath(raw, urlParts = URL_PARTS_REGEX) {
    try {
        const url = new URL(raw);
        if (!url.hostname)
            throw new application_error_1.ApplicationError('Malformed URL');
        return sanitizeRoute(url.pathname);
    }
    catch {
        const match = urlParts.exec(raw);
        if (!match?.groups?.pathname)
            return '';
        const route = match.groups.pathname.split('?').shift();
        return sanitizeRoute(route);
    }
}
function getNumberOfItemsInRuns(runs) {
    return runs.reduce((total, run) => {
        const data = run.data ?? {};
        let count = 0;
        Object.keys(data).forEach((type) => {
            const conn = data[type] ?? [];
            conn.forEach((branch) => {
                count += (branch ?? []).length;
            });
        });
        return total + count;
    }, 0);
}
function generateNodesGraph(workflow, nodeTypes, options) {
    const { runData } = options ?? {};
    const nodeGraph = {
        node_types: [],
        node_connections: [],
        nodes: {},
        notes: {},
        is_pinned: Object.keys(workflow.pinData ?? {}).length > 0,
    };
    const nameIndices = {};
    const webhookNodeNames = [];
    const notes = (workflow.nodes ?? []).filter((node) => node.type === Constants_1.STICKY_NODE_TYPE);
    const otherNodes = (workflow.nodes ?? []).filter((node) => node.type !== Constants_1.STICKY_NODE_TYPE);
    notes.forEach((stickyNote, index) => {
        const stickyType = nodeTypes.getByNameAndVersion(Constants_1.STICKY_NODE_TYPE, stickyNote.typeVersion);
        if (!stickyType) {
            return;
        }
        let nodeParameters = {};
        try {
            nodeParameters =
                (0, NodeHelpers_1.getNodeParameters)(stickyType.description.properties, stickyNote.parameters, true, false, stickyNote) ?? {};
        }
        catch {
        }
        const height = typeof nodeParameters.height === 'number' ? nodeParameters.height : 0;
        const width = typeof nodeParameters.width === 'number' ? nodeParameters.width : 0;
        const topLeft = stickyNote.position;
        const bottomRight = [topLeft[0] + width, topLeft[1] + height];
        const overlapping = Boolean(otherNodes.find((node) => areOverlapping(topLeft, bottomRight, node.position)));
        nodeGraph.notes[index] = {
            overlapping,
            position: topLeft,
            height,
            width,
        };
    });
    otherNodes.forEach((node, index) => {
        nodeGraph.node_types.push(node.type);
        const nodeItem = {
            id: node.id,
            type: node.type,
            version: node.typeVersion,
            position: node.position,
        };
        if (runData?.[node.name]) {
            const runs = runData[node.name] ?? [];
            nodeItem.runs = runs.length;
            nodeItem.items_total = getNumberOfItemsInRuns(runs);
        }
        if (options?.sourceInstanceId) {
            nodeItem.src_instance_id = options.sourceInstanceId;
        }
        if (node.id && options?.nodeIdMap?.[node.id]) {
            nodeItem.src_node_id = options.nodeIdMap[node.id];
        }
        if (node.type === Constants_1.AI_TRANSFORM_NODE_TYPE && options?.isCloudDeployment) {
            nodeItem.prompts = { instructions: node.parameters.instructions };
        }
        else if (node.type === Constants_1.AGENT_LANGCHAIN_NODE_TYPE) {
            nodeItem.agent = node.parameters.agent ?? 'conversationalAgent';
        }
        else if (node.type === Constants_1.MERGE_NODE_TYPE) {
            nodeItem.operation = node.parameters.mode;
        }
        else if (node.type === Constants_1.HTTP_REQUEST_NODE_TYPE && node.typeVersion === 1) {
            try {
                nodeItem.domain = new URL(node.parameters.url).hostname;
            }
            catch {
                nodeItem.domain = getDomainBase(node.parameters.url);
            }
        }
        else if (node.type === Constants_1.HTTP_REQUEST_NODE_TYPE && node.typeVersion > 1) {
            const { authentication } = node.parameters;
            nodeItem.credential_type = {
                none: 'none',
                genericCredentialType: node.parameters.genericAuthType,
                predefinedCredentialType: node.parameters.nodeCredentialType,
            }[authentication];
            nodeItem.credential_set = node.credentials ? Object.keys(node.credentials).length > 0 : false;
            const { url } = node.parameters;
            nodeItem.domain_base = getDomainBase(url);
            nodeItem.domain_path = getDomainPath(url);
            nodeItem.method = node.parameters.requestMethod;
        }
        else if (Constants_1.HTTP_REQUEST_TOOL_LANGCHAIN_NODE_TYPE === node.type) {
            if (!nodeItem.toolSettings)
                nodeItem.toolSettings = {};
            nodeItem.toolSettings.url_type = 'other';
            nodeItem.toolSettings.uses_auth = false;
            nodeItem.toolSettings.placeholders = 0;
            nodeItem.toolSettings.query_from_model_only = false;
            nodeItem.toolSettings.headers_from_model_only = false;
            nodeItem.toolSettings.body_from_model_only = false;
            const toolUrl = node.parameters?.url ?? '';
            nodeItem.toolSettings.placeholders += countPlaceholders(toolUrl);
            const authType = node.parameters?.authentication ?? '';
            if (authType && authType !== 'none') {
                nodeItem.toolSettings.uses_auth = true;
            }
            if (toolUrl.startsWith('{') && toolUrl.endsWith('}')) {
                nodeItem.toolSettings.url_type = 'any';
            }
            else if (toolUrl.includes('google.com')) {
                nodeItem.toolSettings.url_type = 'google';
            }
            if (node.parameters?.sendBody) {
                if (node.parameters?.specifyBody === 'model') {
                    nodeItem.toolSettings.body_from_model_only = true;
                }
                if (node.parameters?.jsonBody) {
                    nodeItem.toolSettings.placeholders += countPlaceholders(node.parameters?.jsonBody);
                }
                if (node.parameters?.parametersBody) {
                    const parameters = (node.parameters?.parametersBody)
                        .values;
                    nodeItem.toolSettings.placeholders += countPlaceholdersInParameters(parameters);
                }
            }
            if (node.parameters?.sendHeaders) {
                if (node.parameters?.specifyHeaders === 'model') {
                    nodeItem.toolSettings.headers_from_model_only = true;
                }
                if (node.parameters?.jsonHeaders) {
                    nodeItem.toolSettings.placeholders += countPlaceholders(node.parameters?.jsonHeaders);
                }
                if (node.parameters?.parametersHeaders) {
                    const parameters = (node.parameters?.parametersHeaders)
                        .values;
                    nodeItem.toolSettings.placeholders += countPlaceholdersInParameters(parameters);
                }
            }
            if (node.parameters?.sendQuery) {
                if (node.parameters?.specifyQuery === 'model') {
                    nodeItem.toolSettings.query_from_model_only = true;
                }
                if (node.parameters?.jsonQuery) {
                    nodeItem.toolSettings.placeholders += countPlaceholders(node.parameters?.jsonQuery);
                }
                if (node.parameters?.parametersQuery) {
                    const parameters = (node.parameters?.parametersQuery)
                        .values;
                    nodeItem.toolSettings.placeholders += countPlaceholdersInParameters(parameters);
                }
            }
        }
        else if (node.type === Constants_1.WEBHOOK_NODE_TYPE) {
            webhookNodeNames.push(node.name);
        }
        else if (node.type === Constants_1.EXECUTE_WORKFLOW_NODE_TYPE ||
            node.type === Constants_1.WORKFLOW_TOOL_LANGCHAIN_NODE_TYPE) {
            if (node.parameters?.workflowId) {
                nodeItem.workflow_id = node.parameters?.workflowId;
            }
        }
        else {
            try {
                const nodeType = nodeTypes.getByNameAndVersion(node.type, node.typeVersion);
                if (nodeType) {
                    const nodeParameters = (0, NodeHelpers_1.getNodeParameters)(nodeType.description.properties, node.parameters, true, false, node);
                    if (nodeParameters) {
                        const keys = [
                            'operation',
                            'resource',
                            'mode',
                        ];
                        keys.forEach((key) => {
                            if (nodeParameters.hasOwnProperty(key)) {
                                nodeItem[key] = nodeParameters[key]?.toString();
                            }
                        });
                    }
                }
            }
            catch (e) {
                if (!(e instanceof Error && e.message.includes('Unrecognized node type'))) {
                    throw e;
                }
            }
        }
        if (options?.isCloudDeployment === true) {
            if (node.type === Constants_1.OPENAI_LANGCHAIN_NODE_TYPE) {
                nodeItem.prompts =
                    (node.parameters?.messages ?? {}).values ?? [];
            }
            if (node.type === Constants_1.AGENT_LANGCHAIN_NODE_TYPE) {
                const prompts = {};
                if (node.parameters?.text) {
                    prompts.text = node.parameters.text;
                }
                const nodeOptions = node.parameters?.options;
                if (nodeOptions) {
                    const optionalMessagesKeys = [
                        'humanMessage',
                        'systemMessage',
                        'humanMessageTemplate',
                        'prefix',
                        'suffixChat',
                        'suffix',
                        'prefixPrompt',
                        'suffixPrompt',
                    ];
                    for (const key of optionalMessagesKeys) {
                        if (nodeOptions[key]) {
                            prompts[key] = nodeOptions[key];
                        }
                    }
                }
                if (Object.keys(prompts).length) {
                    nodeItem.prompts = prompts;
                }
            }
            if (node.type === Constants_1.CHAIN_SUMMARIZATION_LANGCHAIN_NODE_TYPE) {
                nodeItem.prompts = ((node.parameters?.options ?? {})
                    .summarizationMethodAndPrompts ?? {}).values;
            }
            if (Constants_1.LANGCHAIN_CUSTOM_TOOLS.includes(node.type)) {
                nodeItem.prompts = {
                    description: node.parameters?.description ?? '',
                };
            }
            if (node.type === Constants_1.CHAIN_LLM_LANGCHAIN_NODE_TYPE) {
                nodeItem.prompts =
                    (node.parameters?.messages ?? {}).messageValues ?? [];
            }
            if (node.type === Constants_1.MERGE_NODE_TYPE && node.parameters?.operation === 'combineBySql') {
                nodeItem.sql = node.parameters?.query;
            }
        }
        nodeGraph.nodes[index.toString()] = nodeItem;
        nameIndices[node.name] = index.toString();
    });
    const getGraphConnectionItem = (startNode, connectionItem) => {
        return { start: nameIndices[startNode], end: nameIndices[connectionItem.node] };
    };
    Object.keys(workflow.connections ?? []).forEach((nodeName) => {
        const connections = workflow.connections?.[nodeName];
        if (!connections) {
            return;
        }
        Object.keys(connections).forEach((key) => {
            connections[key].forEach((element) => {
                (element ?? []).forEach((element2) => {
                    nodeGraph.node_connections.push(getGraphConnectionItem(nodeName, element2));
                });
            });
        });
    });
    return { nodeGraph, nameIndices, webhookNodeNames };
}
function extractLastExecutedNodeCredentialData(runData) {
    const nodeCredentials = runData?.data?.executionData?.nodeExecutionStack?.[0]?.node?.credentials;
    if (!nodeCredentials)
        return null;
    const credentialType = Object.keys(nodeCredentials)[0] ?? null;
    if (!credentialType)
        return null;
    const { id } = nodeCredentials[credentialType];
    if (!id)
        return null;
    return { credentialId: id, credentialType };
}
const userInInstanceRanOutOfFreeAiCredits = (runData) => {
    const credentials = extractLastExecutedNodeCredentialData(runData);
    if (!credentials)
        return false;
    if (credentials.credentialType !== Constants_1.OPEN_AI_API_CREDENTIAL_TYPE)
        return false;
    const { error } = runData.data.resultData;
    if (!isNodeApiError(error) || !error.messages[0])
        return false;
    const rawErrorResponse = error.messages[0].replace(`${error.httpCode} -`, '');
    try {
        const errorResponse = (0, utils_1.jsonParse)(rawErrorResponse);
        if (errorResponse?.error?.type === Constants_1.FREE_AI_CREDITS_ERROR_TYPE &&
            errorResponse.error.code === Constants_1.FREE_AI_CREDITS_USED_ALL_CREDITS_ERROR_CODE) {
            return true;
        }
    }
    catch {
        return false;
    }
    return false;
};
exports.userInInstanceRanOutOfFreeAiCredits = userInInstanceRanOutOfFreeAiCredits;
function resolveAIMetrics(nodes, nodeTypes) {
    const resolvedNodes = nodes
        .map((x) => [x, nodeTypes.getByNameAndVersion(x.type, x.typeVersion)])
        .filter((x) => !!x[1]?.description);
    const aiNodeCount = resolvedNodes.reduce((acc, x) => acc + Number(x[1].description.codex?.categories?.includes('AI')), 0);
    if (aiNodeCount === 0)
        return {};
    let fromAIOverrideCount = 0;
    let fromAIExpressionCount = 0;
    const tools = resolvedNodes.filter((node) => node[1].description.codex?.subcategories?.AI?.includes('Tools'));
    for (const [node, _] of tools) {
        const values = Object.values(node.parameters).flatMap((param) => {
            if (param && typeof param === 'object' && 'value' in param)
                param = param.value;
            return typeof param === 'string' ? param : [];
        });
        const overrides = values.reduce((acc, value) => acc + Number(value.startsWith(`={{ ${Constants_1.FROM_AI_AUTO_GENERATED_MARKER} $fromA`)), 0);
        fromAIOverrideCount += overrides;
        fromAIExpressionCount +=
            values.reduce((acc, value) => acc + Number(value[0] === '=' && value.includes('$fromA', 2)), 0) - overrides;
    }
    return {
        aiNodeCount,
        aiToolCount: tools.length,
        fromAIOverrideCount,
        fromAIExpressionCount,
    };
}
//# sourceMappingURL=TelemetryHelpers.js.map