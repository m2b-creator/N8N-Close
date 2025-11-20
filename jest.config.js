module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/nodes', '<rootDir>/credentials'],
	testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
	transform: {
		'^.+\\.ts$': ['ts-jest', {
			tsconfig: {
				esModuleInterop: true,
				allowSyntheticDefaultImports: true,
			}
		}],
	},
	collectCoverageFrom: ['**/*.ts', '!**/*.d.ts'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
	},
};