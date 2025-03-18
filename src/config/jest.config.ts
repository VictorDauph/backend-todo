import type { Config } from '@jest/types';
import dotenv from 'dotenv';




dotenv.config({ path: process.env.ENV_FILE || '.env' });

const config: Config.InitialOptions = {
    rootDir: '../../',
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
    },
    testMatch: ['<rootDir>/src/tests/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};

export default config;
