"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateExpression = exports.getEvaluator = exports.checkEvaluatorDifferences = exports.setDifferEnabled = exports.setDiffReporter = exports.setEvaluator = exports.setErrorHandler = void 0;
const tournament_1 = require("@n8n/tournament");
const tmpl = __importStar(require("@n8n_io/riot-tmpl"));
const ExpressionSandboxing_1 = require("./ExpressionSandboxing");
const LoggerProxy = __importStar(require("./LoggerProxy"));
tmpl.brackets.set('{{ }}');
let errorHandler = () => { };
let differenceHandler = () => { };
const differenceChecker = (diff) => {
    try {
        if (diff.same) {
            return;
        }
        if (diff.has?.function || diff.has?.templateString) {
            return;
        }
        if (diff.expression === 'UNPARSEABLE') {
            differenceHandler(diff.expression);
        }
        else {
            differenceHandler(diff.expression.value);
        }
    }
    catch {
        LoggerProxy.error('Expression evaluator difference checker failed');
    }
};
const tournamentEvaluator = new tournament_1.Tournament(errorHandler, undefined, undefined, {
    before: [],
    after: [ExpressionSandboxing_1.PrototypeSanitizer],
});
let evaluator = tmpl.tmpl;
let currentEvaluatorType = 'tmpl';
let diffExpressions = false;
const setErrorHandler = (handler) => {
    errorHandler = handler;
    tmpl.tmpl.errorHandler = handler;
    tournamentEvaluator.errorHandler = handler;
};
exports.setErrorHandler = setErrorHandler;
const setEvaluator = (evalType) => {
    currentEvaluatorType = evalType;
    if (evalType === 'tmpl') {
        evaluator = tmpl.tmpl;
    }
    else if (evalType === 'tournament') {
        evaluator = tournamentEvaluator.execute.bind(tournamentEvaluator);
    }
};
exports.setEvaluator = setEvaluator;
const setDiffReporter = (reporter) => {
    differenceHandler = reporter;
};
exports.setDiffReporter = setDiffReporter;
const setDifferEnabled = (enabled) => {
    diffExpressions = enabled;
};
exports.setDifferEnabled = setDifferEnabled;
const diffCache = {};
const checkEvaluatorDifferences = (expr) => {
    if (expr in diffCache) {
        return diffCache[expr];
    }
    let diff;
    try {
        diff = tournamentEvaluator.tmplDiff(expr);
    }
    catch {
        try {
            differenceHandler('ERROR');
        }
        catch { }
        diff = null;
    }
    if (diff?.same === false) {
        differenceChecker(diff);
    }
    diffCache[expr] = diff;
    return diff;
};
exports.checkEvaluatorDifferences = checkEvaluatorDifferences;
const getEvaluator = () => {
    return evaluator;
};
exports.getEvaluator = getEvaluator;
const evaluateExpression = (expr, data) => {
    if (!diffExpressions) {
        return evaluator(expr, data);
    }
    const diff = (0, exports.checkEvaluatorDifferences)(expr);
    if (!diff?.same) {
        return evaluator(expr, data);
    }
    let tmplValue;
    let tournValue;
    let wasTmplError = false;
    let tmplError;
    let wasTournError = false;
    let tournError;
    try {
        tmplValue = tmpl.tmpl(expr, data);
    }
    catch (error) {
        tmplError = error;
        wasTmplError = true;
    }
    try {
        tournValue = tournamentEvaluator.execute(expr, data);
    }
    catch (error) {
        tournError = error;
        wasTournError = true;
    }
    if (wasTmplError !== wasTournError ||
        JSON.stringify(tmplValue) !== JSON.stringify(tournValue)) {
        try {
            if (diff.expression) {
                differenceHandler(diff.expression.value);
            }
            else {
                differenceHandler('VALUEDIFF');
            }
        }
        catch {
            LoggerProxy.error('Failed to report error difference');
        }
    }
    if (currentEvaluatorType === 'tmpl') {
        if (wasTmplError) {
            throw tmplError;
        }
        return tmplValue;
    }
    if (wasTournError) {
        throw tournError;
    }
    return tournValue;
};
exports.evaluateExpression = evaluateExpression;
//# sourceMappingURL=ExpressionEvaluatorProxy.js.map