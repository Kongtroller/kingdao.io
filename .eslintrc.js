module.exports = {
module.exports = {
  env: {
    browser: true,
    node:    true,
    es2021:  true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['react'],
  rules: {
    'quotes':           ['error', 'single', { avoidEscape: true }],
    'semi':             ['error', 'always'],
    'no-console':       'warn',
    'comma-dangle':     ['error', 'always-multiline'],
    'react/prop-types': 'off'
  },
  settings: {
    react: { version: 'detect' }
  }
};
