module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^node:(.*)$': '<rootDir>/node_modules/$1'
  },
  coverageThreshold: {
    global: {
      branches: 97.73,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  coverageReporters: ['json', 'lcov', 'text', 'clover']
}
