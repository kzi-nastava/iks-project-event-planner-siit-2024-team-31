module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/e2e/tests/**/*.e2e.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },

  setupFilesAfterEnv: ["<rootDir>/e2e/setup/jest.setup.ts"],
  testTimeout: 120000, // 2 minutes for visual tests
  maxWorkers: 1,
  forceExit: true,
  detectOpenHandles: true,
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
  collectCoverage: false,

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@e2e/(.*)$": "<rootDir>/e2e/$1",
  },
};
