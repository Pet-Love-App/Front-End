/**
 * E2E 测试 Jest 配置
 */

module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/__tests__/**/*.e2e.{ts,tsx}'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
