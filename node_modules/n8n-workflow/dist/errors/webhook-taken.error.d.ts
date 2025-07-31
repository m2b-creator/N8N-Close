import { WorkflowActivationError } from './workflow-activation.error';
export declare class WebhookPathTakenError extends WorkflowActivationError {
    constructor(nodeName: string, cause?: Error);
}
