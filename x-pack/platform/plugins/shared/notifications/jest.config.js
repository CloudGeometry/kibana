/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

module.exports = {
  preset: '@kbn/test/jest_node',
  rootDir: '../../../../..',
  roots: ['<rootDir>/x-pack/platform/plugins/shared/notifications'],
  coverageDirectory:
    '<rootDir>/target/kibana-coverage/jest/x-pack/platform/plugins/shared/notifications',
  coverageReporters: ['text', 'html'],
  collectCoverageFrom: [
    '<rootDir>/x-pack/platform/plugins/shared/notifications/{common,server}/**/*.{js,ts,tsx}',
  ],
};
