module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  watchman: false,
  roots: ['<rootDir>/test'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
};
