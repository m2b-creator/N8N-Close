"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
function create(target, parent, option, depth) {
    depth = depth || 0;
    for (const key in target) {
        if (typeof target[key] === 'object' && target[key] !== null) {
            target[key] = create(target[key], (parent || target), option, depth + 1);
        }
    }
    Object.defineProperty(target, '__dataChanged', {
        value: false,
        writable: true,
    });
    return new Proxy(target, {
        deleteProperty(target, name) {
            if (parent === undefined) {
                target.__dataChanged = true;
            }
            else {
                parent.__dataChanged = true;
            }
            return Reflect.deleteProperty(target, name);
        },
        get(target, name, receiver) {
            return Reflect.get(target, name, receiver);
        },
        has(target, key) {
            return Reflect.has(target, key);
        },
        set(target, name, value) {
            if (parent === undefined) {
                if (option !== undefined &&
                    option.ignoreEmptyOnFirstChild === true &&
                    depth === 0 &&
                    target[name.toString()] === undefined &&
                    typeof value === 'object' &&
                    Object.keys(value).length === 0) {
                }
                else {
                    target.__dataChanged = true;
                }
            }
            else {
                parent.__dataChanged = true;
            }
            return Reflect.set(target, name, value);
        },
    });
}
//# sourceMappingURL=ObservableObject.js.map