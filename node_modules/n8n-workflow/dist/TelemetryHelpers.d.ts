import type { INode, INodesGraphResult, IWorkflowBase, INodeTypes, IRunData, IRun } from './Interfaces';
export declare function getNodeTypeForName(workflow: IWorkflowBase, nodeName: string): INode | undefined;
export declare function isNumber(value: unknown): value is number;
export declare function getDomainBase(raw: string, urlParts?: RegExp): string;
export declare const ANONYMIZATION_CHARACTER = "*";
export declare function getDomainPath(raw: string, urlParts?: RegExp): string;
export declare function generateNodesGraph(workflow: Partial<IWorkflowBase>, nodeTypes: INodeTypes, options?: {
    sourceInstanceId?: string;
    nodeIdMap?: {
        [curr: string]: string;
    };
    isCloudDeployment?: boolean;
    runData?: IRunData;
}): INodesGraphResult;
export declare function extractLastExecutedNodeCredentialData(runData: IRun): null | {
    credentialId: string;
    credentialType: string;
};
export declare const userInInstanceRanOutOfFreeAiCredits: (runData: IRun) => boolean;
export type FromAICount = {
    aiNodeCount: number;
    aiToolCount: number;
    fromAIOverrideCount: number;
    fromAIExpressionCount: number;
};
export declare function resolveAIMetrics(nodes: INode[], nodeTypes: INodeTypes): FromAICount | {};
