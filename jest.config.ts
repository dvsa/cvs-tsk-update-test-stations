import type { Config } from '@jest/types';

// https://jestjs.io/docs/en/configuration.html
const config: Config.InitialOptions = {
  moduleFileExtensions: ["ts", "js"],
  // overrides
  // https://kulshekhar.github.io/ts-jest/docs/options
  preset: 'ts-jest',
  verbose: true,
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    //TODO Add for integration
    '**/?(*.)+(spec|test).[tj]s?(x)',
  ],
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.{js,ts}', '!**/node_modules/**'],
  //TODO Add for integration
  coverageDirectory: 'coverage/unit',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/.webpack/',
    '/.build/',
    '/.serverless/',
    '/reports/',
    '/.artifact/',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  globals: {
    'ts-jest': {},
  },
};

export default config;
