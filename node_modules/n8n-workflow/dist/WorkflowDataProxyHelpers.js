"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPinDataIfManualExecution = getPinDataIfManualExecution;
function getPinDataIfManualExecution(workflow, nodeName, mode) {
    if (mode !== 'manual') {
        return undefined;
    }
    return workflow.getPinDataOfNode(nodeName);
}
//# sourceMappingURL=WorkflowDataProxyHelpers.js.map