"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeConnectionTypes = exports.NodeConnectionType = exports.Node = exports.ICredentialsHelper = exports.ICredentials = void 0;
class ICredentials {
    constructor(nodeCredentials, type, data) {
        this.id = nodeCredentials.id ?? undefined;
        this.name = nodeCredentials.name;
        this.type = type;
        this.data = data;
    }
}
exports.ICredentials = ICredentials;
class ICredentialsHelper {
}
exports.ICredentialsHelper = ICredentialsHelper;
class Node {
}
exports.Node = Node;
var NodeConnectionType;
(function (NodeConnectionType) {
    NodeConnectionType["AiAgent"] = "ai_agent";
    NodeConnectionType["AiChain"] = "ai_chain";
    NodeConnectionType["AiDocument"] = "ai_document";
    NodeConnectionType["AiEmbedding"] = "ai_embedding";
    NodeConnectionType["AiLanguageModel"] = "ai_languageModel";
    NodeConnectionType["AiMemory"] = "ai_memory";
    NodeConnectionType["AiOutputParser"] = "ai_outputParser";
    NodeConnectionType["AiRetriever"] = "ai_retriever";
    NodeConnectionType["AiTextSplitter"] = "ai_textSplitter";
    NodeConnectionType["AiTool"] = "ai_tool";
    NodeConnectionType["AiVectorStore"] = "ai_vectorStore";
    NodeConnectionType["Main"] = "main";
})(NodeConnectionType || (exports.NodeConnectionType = NodeConnectionType = {}));
exports.nodeConnectionTypes = [
    "ai_agent",
    "ai_chain",
    "ai_document",
    "ai_embedding",
    "ai_languageModel",
    "ai_memory",
    "ai_outputParser",
    "ai_retriever",
    "ai_textSplitter",
    "ai_tool",
    "ai_vectorStore",
    "main",
];
//# sourceMappingURL=Interfaces.js.map