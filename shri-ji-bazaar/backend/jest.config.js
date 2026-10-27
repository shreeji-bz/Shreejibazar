// Jest config. Pure unit tests live alongside the source they cover
// (src/…spec.ts) so they run with no database. Anything that needs the
// real Supabase/Postgres stays under test/ and uses test/setup.ts.
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  watchman: false,
  roots: ['<rootDir>/test', '<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { isolatedModules: true, esModuleInterop: true }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
};
