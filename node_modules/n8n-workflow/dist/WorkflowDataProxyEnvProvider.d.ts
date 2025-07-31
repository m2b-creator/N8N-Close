export type EnvProviderState = {
    isProcessAvailable: boolean;
    isEnvAccessBlocked: boolean;
    env: Record<string, string>;
};
export declare function createEnvProviderState(): EnvProviderState;
export declare function createEnvProvider(runIndex: number, itemIndex: number, providerState: EnvProviderState): Record<string, string>;
