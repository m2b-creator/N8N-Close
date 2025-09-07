import type { IPollFunctions, ILoadOptionsFunctions, INodeExecutionData, INodeType, INodeTypeDescription, INodePropertyOptions } from 'n8n-workflow';
export declare class CloseTrigger implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: {
            getLeadStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
            getSmartViews(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
            getOpportunityStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
        };
    };
    poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null>;
}
