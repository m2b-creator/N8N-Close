"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureError = ensureError;
function ensureError(error) {
    return error instanceof Error
        ? error
        : new Error('Error that was not an instance of Error was thrown', {
            cause: error,
        });
}
//# sourceMappingURL=ensure-error.js.map