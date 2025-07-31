import * as tmpl from '@n8n_io/riot-tmpl';
import type { IDataObject, IExecuteData, INode, INodeExecutionData, INodeParameterResourceLocator, INodeParameters, IRunExecutionData, IWorkflowDataProxyAdditionalKeys, NodeParameterValue, NodeParameterValueType, WorkflowExecuteMode } from './Interfaces';
import type { Workflow } from './Workflow';
export declare class Expression {
    private readonly workflow;
    constructor(workflow: Workflow);
    static resolveWithoutWorkflow(expression: string, data?: IDataObject): tmpl.ReturnValue;
    convertObjectValueToString(value: object): string;
    resolveSimpleParameterValue(parameterValue: NodeParameterValue, siblingParameters: INodeParameters, runExecutionData: IRunExecutionData | null, runIndex: number, itemIndex: number, activeNodeName: string, connectionInputData: INodeExecutionData[], mode: WorkflowExecuteMode, additionalKeys: IWorkflowDataProxyAdditionalKeys, executeData?: IExecuteData, returnObjectAsString?: boolean, selfData?: {}, contextNodeName?: string): NodeParameterValue | INodeParameters | NodeParameterValue[] | INodeParameters[];
    private renderExpression;
    getSimpleParameterValue(node: INode, parameterValue: string | boolean | undefined, mode: WorkflowExecuteMode, additionalKeys: IWorkflowDataProxyAdditionalKeys, executeData?: IExecuteData, defaultValue?: boolean | number | string | unknown[]): boolean | number | string | undefined | unknown[];
    getComplexParameterValue(node: INode, parameterValue: NodeParameterValue | INodeParameters | NodeParameterValue[] | INodeParameters[], mode: WorkflowExecuteMode, additionalKeys: IWorkflowDataProxyAdditionalKeys, executeData?: IExecuteData, defaultValue?: NodeParameterValueType | undefined, selfData?: {}): NodeParameterValueType | undefined;
    getParameterValue(parameterValue: NodeParameterValueType | INodeParameterResourceLocator, runExecutionData: IRunExecutionData | null, runIndex: number, itemIndex: number, activeNodeName: string, connectionInputData: INodeExecutionData[], mode: WorkflowExecuteMode, additionalKeys: IWorkflowDataProxyAdditionalKeys, executeData?: IExecuteData, returnObjectAsString?: boolean, selfData?: {}, contextNodeName?: string): NodeParameterValueType;
}
