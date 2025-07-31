"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationalError = void 0;
const base_error_1 = require("./base.error");
class OperationalError extends base_error_1.BaseError {
    constructor(message, opts = {}) {
        opts.level = opts.level ?? 'warning';
        super(message, opts);
    }
}
exports.OperationalError = OperationalError;
//# sourceMappingURL=operational.error.js.map