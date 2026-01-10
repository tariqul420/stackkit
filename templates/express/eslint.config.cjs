module.exports = [
  // Global ignores
  {
    ignores: ['**/node_modules/**', '**/dist/**', '.env'],
  },

  // TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      'prefer-const': 'error',
      'no-console': 'off',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'multi-line'],
      'no-implicit-coercion': ['warn', { allow: ['!!'] }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^(?:_|next)$' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // JavaScript files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {},
  },
];
