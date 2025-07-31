"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseApi = void 0;
class CloseApi {
    constructor() {
        this.name = 'closeApi';
        this.displayName = 'Close API';
        this.documentationUrl = 'https://developer.close.com/';
        this.properties = [
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                required: true,
                description: 'Your Close CRM API key',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                auth: {
                    username: '={{$credentials.apiKey}}',
                    password: '',
                },
            },
        };
        this.test = {
            request: {
                baseURL: 'https://api.close.com/api/v1',
                url: '/me/',
                method: 'GET',
            },
        };
    }
}
exports.CloseApi = CloseApi;
