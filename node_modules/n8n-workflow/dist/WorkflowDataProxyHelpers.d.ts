import type { INodeExecutionData, Workflow, WorkflowExecuteMode } from '.';
export declare function getPinDataIfManualExecution(workflow: Workflow, nodeName: string, mode: WorkflowExecuteMode): INodeExecutionData[] | undefined;
