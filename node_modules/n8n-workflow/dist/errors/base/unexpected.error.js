"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnexpectedError = void 0;
const base_error_1 = require("./base.error");
class UnexpectedError extends base_error_1.BaseError {
    constructor(message, opts = {}) {
        opts.level = opts.level ?? 'error';
        super(message, opts);
    }
}
exports.UnexpectedError = UnexpectedError;
//# sourceMappingURL=unexpected.error.js.map