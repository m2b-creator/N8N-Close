import type { ITaskMetadata } from '.';
type ISubWorkflowMetadata = Required<Pick<ITaskMetadata, 'subExecution' | 'subExecutionsCount'>>;
export declare function parseErrorMetadata(error: unknown): ISubWorkflowMetadata | undefined;
export {};
