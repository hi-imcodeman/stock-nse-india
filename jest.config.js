module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
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
