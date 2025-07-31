"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFilterValue = exports.isResourceMapperValue = exports.isValidResourceLocatorParameterValue = exports.isINodePropertyCollectionList = exports.isINodePropertyOptionsList = exports.isINodePropertiesList = exports.isINodePropertyCollection = exports.isINodePropertyOptions = exports.isINodeProperties = void 0;
const isINodeProperties = (item) => 'name' in item && 'type' in item && !('value' in item);
exports.isINodeProperties = isINodeProperties;
const isINodePropertyOptions = (item) => 'value' in item && 'name' in item && !('displayName' in item);
exports.isINodePropertyOptions = isINodePropertyOptions;
const isINodePropertyCollection = (item) => 'values' in item && 'name' in item && 'displayName' in item;
exports.isINodePropertyCollection = isINodePropertyCollection;
const isINodePropertiesList = (items) => Array.isArray(items) && items.every(exports.isINodeProperties);
exports.isINodePropertiesList = isINodePropertiesList;
const isINodePropertyOptionsList = (items) => Array.isArray(items) && items.every(exports.isINodePropertyOptions);
exports.isINodePropertyOptionsList = isINodePropertyOptionsList;
const isINodePropertyCollectionList = (items) => {
    return Array.isArray(items) && items.every(exports.isINodePropertyCollection);
};
exports.isINodePropertyCollectionList = isINodePropertyCollectionList;
const isValidResourceLocatorParameterValue = (value) => {
    if (typeof value === 'object') {
        if (typeof value.value === 'number') {
            return true;
        }
        return !!value.value;
    }
    else {
        return !!value;
    }
};
exports.isValidResourceLocatorParameterValue = isValidResourceLocatorParameterValue;
const isResourceMapperValue = (value) => {
    return (typeof value === 'object' &&
        value !== null &&
        'mappingMode' in value &&
        'schema' in value &&
        'value' in value);
};
exports.isResourceMapperValue = isResourceMapperValue;
const isFilterValue = (value) => {
    return (typeof value === 'object' && value !== null && 'conditions' in value && 'combinator' in value);
};
exports.isFilterValue = isFilterValue;
//# sourceMappingURL=type-guards.js.map