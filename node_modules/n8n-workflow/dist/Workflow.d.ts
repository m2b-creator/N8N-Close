import { Expression } from './Expression';
import type { IConnections, INode, INodeExecutionData, INodes, INodeType, INodeTypes, IPinData, IWorkflowSettings, IConnectedNode, IDataObject, INodeConnection, NodeParameterValueType } from './Interfaces';
import { NodeConnectionType } from './Interfaces';
export interface WorkflowParameters {
    id?: string;
    name?: string;
    nodes: INode[];
    connections: IConnections;
    active: boolean;
    nodeTypes: INodeTypes;
    staticData?: IDataObject;
    settings?: IWorkflowSettings;
    pinData?: IPinData;
}
export declare class Workflow {
    id: string;
    name: string | undefined;
    nodes: INodes;
    connectionsBySourceNode: IConnections;
    connectionsByDestinationNode: IConnections;
    nodeTypes: INodeTypes;
    expression: Expression;
    active: boolean;
    settings: IWorkflowSettings;
    readonly timezone: string;
    staticData: IDataObject;
    testStaticData: IDataObject | undefined;
    pinData?: IPinData;
    constructor(parameters: WorkflowParameters);
    overrideStaticData(staticData?: IDataObject): void;
    static getConnectionsByDestination(connections: IConnections): IConnections;
    getStaticData(type: string, node?: INode): IDataObject;
    setTestStaticData(testStaticData: IDataObject): void;
    getTriggerNodes(): INode[];
    getPollNodes(): INode[];
    queryNodes(checkFunction: (nodeType: INodeType) => boolean): INode[];
    getNode(nodeName: string): INode | null;
    getNodes(nodeNames: string[]): INode[];
    getPinDataOfNode(nodeName: string): INodeExecutionData[] | undefined;
    renameNodeInParameterValue(parameterValue: NodeParameterValueType, currentName: string, newName: string, { hasRenamableContent }?: {
        hasRenamableContent: boolean;
    }): NodeParameterValueType;
    renameNode(currentName: string, newName: string): void;
    getHighestNode(nodeName: string, nodeConnectionIndex?: number, checkedNodes?: string[]): string[];
    getChildNodes(nodeName: string, type?: NodeConnectionType | 'ALL' | 'ALL_NON_MAIN', depth?: number): string[];
    getParentNodes(nodeName: string, type?: NodeConnectionType | 'ALL' | 'ALL_NON_MAIN', depth?: number): string[];
    getConnectedNodes(connections: IConnections, nodeName: string, connectionType?: NodeConnectionType | 'ALL' | 'ALL_NON_MAIN', depth?: number, checkedNodesIncoming?: string[]): string[];
    getParentNodesByDepth(nodeName: string, maxDepth?: number): IConnectedNode[];
    searchNodesBFS(connections: IConnections, sourceNode: string, maxDepth?: number): IConnectedNode[];
    getParentMainInputNode(node: INode): INode;
    getNodeConnectionIndexes(nodeName: string, parentNodeName: string, type?: NodeConnectionType, depth?: number, checkedNodes?: string[]): INodeConnection | undefined;
    __getStartNode(nodeNames: string[]): INode | undefined;
    getStartNode(destinationNode?: string): INode | undefined;
}
