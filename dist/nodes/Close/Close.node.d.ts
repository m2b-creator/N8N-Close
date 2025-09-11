import type { IExecuteFunctions, ILoadOptionsFunctions, INodeExecutionData, INodePropertyOptions, INodeType, INodeTypeDescription } from 'n8n-workflow';
export declare class Close implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: {
            getLeadStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
            getOpportunityStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
            getCustomFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
            getCustomFieldChoices(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
            getSmartViews(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
            getUsers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
            getCustomActivityTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
        };
    };
    /**
     * Validates required parameters for the given resource and operation
     */
    private static validateParametersForItem;
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
