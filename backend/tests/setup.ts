import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '../.env.test') });

// Set default test environment variables if not defined
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI_TEST = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/gem_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';
process.env.PORT = '5001';

// Increase timeout for slow operations
jest.setTimeout(30000);

// Global before all tests
beforeAll(async () => {
  // Any global setup (e.g., connect to test DB) - but we do it per test suite to avoid conflicts
  console.log('🧪 Test environment initialized');
});

// Global after all tests
afterAll(async () => {
  console.log('🧪 Test environment cleaned up');
});

// Suppress console logs during tests (optional)
// jest.spyOn(console, 'log').mockImplementation(() => {});
// jest.spyOn(console, 'error').mockImplementation(() => {});