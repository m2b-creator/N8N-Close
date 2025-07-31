"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizer = exports.PrototypeSanitizer = exports.sanitizerName = void 0;
const tournament_1 = require("@n8n/tournament");
const errors_1 = require("./errors");
const forbiddenMembers = ['__proto__', 'prototype', 'constructor', 'getPrototypeOf'];
exports.sanitizerName = '__sanitize';
const sanitizerIdentifier = tournament_1.astBuilders.identifier(exports.sanitizerName);
const PrototypeSanitizer = (ast, dataNode) => {
    (0, tournament_1.astVisit)(ast, {
        visitMemberExpression(path) {
            this.traverse(path);
            const node = path.node;
            if (!node.computed) {
                if (node.property.type !== 'Identifier') {
                    throw new errors_1.ExpressionError(`Unknown property type ${node.property.type} while sanitising expression`);
                }
                if (forbiddenMembers.includes(node.property.name)) {
                    throw new errors_1.ExpressionError(`Cannot access "${node.property.name}" due to security concerns`);
                }
            }
            else if (node.property.type === 'StringLiteral' || node.property.type === 'Literal') {
                if (forbiddenMembers.includes(node.property.value)) {
                    throw new errors_1.ExpressionError(`Cannot access "${node.property.value}" due to security concerns`);
                }
            }
            else if (!node.property.type.endsWith('Literal')) {
                path.replace(tournament_1.astBuilders.memberExpression(node.object, tournament_1.astBuilders.callExpression(tournament_1.astBuilders.memberExpression(dataNode, sanitizerIdentifier), [
                    node.property,
                ]), true));
            }
        },
    });
};
exports.PrototypeSanitizer = PrototypeSanitizer;
const sanitizer = (value) => {
    if (forbiddenMembers.includes(value)) {
        throw new errors_1.ExpressionError(`Cannot access "${value}" due to security concerns`);
    }
    return value;
};
exports.sanitizer = sanitizer;
//# sourceMappingURL=ExpressionSandboxing.js.map