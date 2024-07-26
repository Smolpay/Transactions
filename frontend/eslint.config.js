const { FlatCompat } = require('@eslint/eslintrc');
const standard = require('eslint-config-standard');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
});

module.exports = [
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
        },
      },
    },
    rules: {
      semi: ['error', 'always'],
    },
  },
  ...compat.extends('standard'),
];









