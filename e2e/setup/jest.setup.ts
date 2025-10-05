import { TestConfig } from '../config/test-config';

beforeAll(async () => {
  console.log('Setting up E2E test environment...');

  jest.setTimeout(TestConfig.timeouts.pageLoad);

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  console.log('E2E test environment setup complete');
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {});
