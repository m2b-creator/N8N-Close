"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPEN_AI_API_CREDENTIAL_TYPE = exports.TRIMMED_TASK_DATA_CONNECTIONS_KEY = exports.AI_TRANSFORM_JS_CODE = exports.AI_TRANSFORM_CODE_GENERATED_FOR_PROMPT = exports.SEND_AND_WAIT_OPERATION = exports.LANGCHAIN_CUSTOM_TOOLS = exports.HTTP_REQUEST_TOOL_LANGCHAIN_NODE_TYPE = exports.WORKFLOW_TOOL_LANGCHAIN_NODE_TYPE = exports.CODE_TOOL_LANGCHAIN_NODE_TYPE = exports.CHAIN_SUMMARIZATION_LANGCHAIN_NODE_TYPE = exports.OPENAI_LANGCHAIN_NODE_TYPE = exports.CHAIN_LLM_LANGCHAIN_NODE_TYPE = exports.AGENT_LANGCHAIN_NODE_TYPE = exports.MANUAL_CHAT_TRIGGER_LANGCHAIN_NODE_TYPE = exports.NODES_WITH_RENAMABLE_CONTENT = exports.ADD_FORM_NOTICE = exports.SCRIPTING_NODE_TYPES = exports.STARTING_NODE_TYPES = exports.WAIT_NODE_TYPE = exports.CHAT_TRIGGER_NODE_TYPE = exports.FORM_TRIGGER_NODE_TYPE = exports.FORM_NODE_TYPE = exports.AI_TRANSFORM_NODE_TYPE = exports.MERGE_NODE_TYPE = exports.FUNCTION_ITEM_NODE_TYPE = exports.FUNCTION_NODE_TYPE = exports.CODE_NODE_TYPE = exports.EXECUTE_WORKFLOW_TRIGGER_NODE_TYPE = exports.EXECUTE_WORKFLOW_NODE_TYPE = exports.START_NODE_TYPE = exports.ERROR_TRIGGER_NODE_TYPE = exports.MANUAL_TRIGGER_NODE_TYPE = exports.WEBHOOK_NODE_TYPE = exports.HTTP_REQUEST_NODE_TYPE = exports.NO_OP_NODE_TYPE = exports.STICKY_NODE_TYPE = exports.UNKNOWN_ERROR_MESSAGE_CRED = exports.UNKNOWN_ERROR_DESCRIPTION = exports.UNKNOWN_ERROR_MESSAGE = exports.FORM_TRIGGER_PATH_IDENTIFIER = exports.CREDENTIAL_EMPTY_VALUE = exports.CODE_EXECUTION_MODES = exports.CODE_LANGUAGES = exports.LOG_LEVELS = exports.WAIT_INDEFINITELY = exports.BINARY_ENCODING = exports.ALPHABET = exports.LOWERCASE_LETTERS = exports.UPPERCASE_LETTERS = exports.DIGITS = void 0;
exports.WAITING_FORMS_EXECUTION_STATUS = exports.PROJECT_ROOT = exports.FROM_AI_AUTO_GENERATED_MARKER = exports.FREE_AI_CREDITS_USED_ALL_CREDITS_ERROR_CODE = exports.FREE_AI_CREDITS_ERROR_TYPE = void 0;
exports.DIGITS = '0123456789';
exports.UPPERCASE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
exports.LOWERCASE_LETTERS = exports.UPPERCASE_LETTERS.toLowerCase();
exports.ALPHABET = [exports.DIGITS, exports.UPPERCASE_LETTERS, exports.LOWERCASE_LETTERS].join('');
exports.BINARY_ENCODING = 'base64';
exports.WAIT_INDEFINITELY = new Date('3000-01-01T00:00:00.000Z');
exports.LOG_LEVELS = ['silent', 'error', 'warn', 'info', 'debug'];
exports.CODE_LANGUAGES = ['javaScript', 'python'];
exports.CODE_EXECUTION_MODES = ['runOnceForAllItems', 'runOnceForEachItem'];
exports.CREDENTIAL_EMPTY_VALUE = '__n8n_EMPTY_VALUE_7b1af746-3729-4c60-9b9b-e08eb29e58da';
exports.FORM_TRIGGER_PATH_IDENTIFIER = 'n8n-form';
exports.UNKNOWN_ERROR_MESSAGE = 'There was an unknown issue while executing the node';
exports.UNKNOWN_ERROR_DESCRIPTION = 'Double-check the node configuration and the service it connects to. Check the error details below and refer to the <a href="https://docs.n8n.io" target="_blank">n8n documentation</a> to troubleshoot the issue.';
exports.UNKNOWN_ERROR_MESSAGE_CRED = 'UNKNOWN ERROR';
exports.STICKY_NODE_TYPE = 'n8n-nodes-base.stickyNote';
exports.NO_OP_NODE_TYPE = 'n8n-nodes-base.noOp';
exports.HTTP_REQUEST_NODE_TYPE = 'n8n-nodes-base.httpRequest';
exports.WEBHOOK_NODE_TYPE = 'n8n-nodes-base.webhook';
exports.MANUAL_TRIGGER_NODE_TYPE = 'n8n-nodes-base.manualTrigger';
exports.ERROR_TRIGGER_NODE_TYPE = 'n8n-nodes-base.errorTrigger';
exports.START_NODE_TYPE = 'n8n-nodes-base.start';
exports.EXECUTE_WORKFLOW_NODE_TYPE = 'n8n-nodes-base.executeWorkflow';
exports.EXECUTE_WORKFLOW_TRIGGER_NODE_TYPE = 'n8n-nodes-base.executeWorkflowTrigger';
exports.CODE_NODE_TYPE = 'n8n-nodes-base.code';
exports.FUNCTION_NODE_TYPE = 'n8n-nodes-base.function';
exports.FUNCTION_ITEM_NODE_TYPE = 'n8n-nodes-base.functionItem';
exports.MERGE_NODE_TYPE = 'n8n-nodes-base.merge';
exports.AI_TRANSFORM_NODE_TYPE = 'n8n-nodes-base.aiTransform';
exports.FORM_NODE_TYPE = 'n8n-nodes-base.form';
exports.FORM_TRIGGER_NODE_TYPE = 'n8n-nodes-base.formTrigger';
exports.CHAT_TRIGGER_NODE_TYPE = '@n8n/n8n-nodes-langchain.chatTrigger';
exports.WAIT_NODE_TYPE = 'n8n-nodes-base.wait';
exports.STARTING_NODE_TYPES = [
    exports.MANUAL_TRIGGER_NODE_TYPE,
    exports.EXECUTE_WORKFLOW_TRIGGER_NODE_TYPE,
    exports.ERROR_TRIGGER_NODE_TYPE,
    exports.START_NODE_TYPE,
];
exports.SCRIPTING_NODE_TYPES = [
    exports.FUNCTION_NODE_TYPE,
    exports.FUNCTION_ITEM_NODE_TYPE,
    exports.CODE_NODE_TYPE,
    exports.AI_TRANSFORM_NODE_TYPE,
];
exports.ADD_FORM_NOTICE = 'addFormPage';
exports.NODES_WITH_RENAMABLE_CONTENT = new Set([
    exports.CODE_NODE_TYPE,
    exports.FUNCTION_NODE_TYPE,
    exports.FUNCTION_ITEM_NODE_TYPE,
    exports.AI_TRANSFORM_NODE_TYPE,
]);
exports.MANUAL_CHAT_TRIGGER_LANGCHAIN_NODE_TYPE = '@n8n/n8n-nodes-langchain.manualChatTrigger';
exports.AGENT_LANGCHAIN_NODE_TYPE = '@n8n/n8n-nodes-langchain.agent';
exports.CHAIN_LLM_LANGCHAIN_NODE_TYPE = '@n8n/n8n-nodes-langchain.chainLlm';
exports.OPENAI_LANGCHAIN_NODE_TYPE = '@n8n/n8n-nodes-langchain.openAi';
exports.CHAIN_SUMMARIZATION_LANGCHAIN_NODE_TYPE = '@n8n/n8n-nodes-langchain.chainSummarization';
exports.CODE_TOOL_LANGCHAIN_NODE_TYPE = '@n8n/n8n-nodes-langchain.toolCode';
exports.WORKFLOW_TOOL_LANGCHAIN_NODE_TYPE = '@n8n/n8n-nodes-langchain.toolWorkflow';
exports.HTTP_REQUEST_TOOL_LANGCHAIN_NODE_TYPE = '@n8n/n8n-nodes-langchain.toolHttpRequest';
exports.LANGCHAIN_CUSTOM_TOOLS = [
    exports.CODE_TOOL_LANGCHAIN_NODE_TYPE,
    exports.WORKFLOW_TOOL_LANGCHAIN_NODE_TYPE,
    exports.HTTP_REQUEST_TOOL_LANGCHAIN_NODE_TYPE,
];
exports.SEND_AND_WAIT_OPERATION = 'sendAndWait';
exports.AI_TRANSFORM_CODE_GENERATED_FOR_PROMPT = 'codeGeneratedForPrompt';
exports.AI_TRANSFORM_JS_CODE = 'jsCode';
exports.TRIMMED_TASK_DATA_CONNECTIONS_KEY = '__isTrimmedManualExecutionDataItem';
exports.OPEN_AI_API_CREDENTIAL_TYPE = 'openAiApi';
exports.FREE_AI_CREDITS_ERROR_TYPE = 'free_ai_credits_request_error';
exports.FREE_AI_CREDITS_USED_ALL_CREDITS_ERROR_CODE = 400;
exports.FROM_AI_AUTO_GENERATED_MARKER = '/*n8n-auto-generated-fromAI-override*/';
exports.PROJECT_ROOT = '0';
exports.WAITING_FORMS_EXECUTION_STATUS = 'n8n-execution-status';
//# sourceMappingURL=Constants.js.map