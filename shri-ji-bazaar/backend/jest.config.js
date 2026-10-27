<<<<<<< HEAD
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  watchman: false,
  roots: ['<rootDir>/test'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
=======
/**
 * Jest config for pure, DB-free unit tests. Integration tests that need the
 * real Supabase/Postgres should keep requiring test/setup.ts; the config below
 * leaves testMatch flexible so both can coexist.
 */
module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  testMatch: ['**/test/**/*.spec.ts', '**/src/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { isolatedModules: true, esModuleInterop: true }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
>>>>>>> 497f511 (feat: add crossing/palti play types, testable settlement, auto-settle + date-wise rounds)
};
