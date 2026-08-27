import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^.+\\.(svg)$': '<rootDir>/src/__mocks__/svg.tsx',
  },
  testMatch: ['<rootDir>/src/**/__tests__/**/*.[jt]s?(x)'],
};

export default async function jestConfig() {
  const nextConfigFn = createJestConfig(customJestConfig);
  const config = await nextConfigFn();
  config.moduleNameMapper = {
    '^.+\\.(svg)$': '<rootDir>/src/__mocks__/svg.tsx',
    ...config.moduleNameMapper,
  };
  return config;
}
