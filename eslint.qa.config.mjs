// Grow this linted QA surface gradually; do not disable application lint rules.
export default [{
  files: ['scripts/**/*.mjs'],
  languageOptions: {
    ecmaVersion: 'latest', sourceType: 'module',
    globals: { console: 'readonly', process: 'readonly', Buffer: 'readonly', URL: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly' },
  },
  rules: {
    'no-undef': 'error',
    'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
    'no-unreachable': 'error',
    'valid-typeof': 'error',
    'no-constant-condition': 'error',
  },
}];
