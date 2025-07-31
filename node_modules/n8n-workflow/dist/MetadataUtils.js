"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseErrorMetadata = parseErrorMetadata;
const utils_1 = require("./utils");
function responseHasSubworkflowData(response) {
    return ['executionId', 'workflowId'].every((x) => (0, utils_1.hasKey)(response, x) && typeof response[x] === 'string');
}
function parseErrorResponseWorkflowMetadata(response) {
    if (!responseHasSubworkflowData(response))
        return undefined;
    return {
        subExecution: {
            executionId: response.executionId,
            workflowId: response.workflowId,
        },
        subExecutionsCount: 1,
    };
}
function parseErrorMetadata(error) {
    if ((0, utils_1.hasKey)(error, 'errorResponse')) {
        return parseErrorResponseWorkflowMetadata(error.errorResponse);
    }
    return undefined;
}
//# sourceMappingURL=MetadataUtils.js.map