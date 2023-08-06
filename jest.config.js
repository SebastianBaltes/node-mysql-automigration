module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globalSetup: "./testSetup.js",
  globalTeardown: "./testTeardown.js",
};
