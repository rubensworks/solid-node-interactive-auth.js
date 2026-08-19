const config = require('@rubensworks/eslint-config');

module.exports = config([
  {
    files: [ '**/*.ts' ],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [ './tsconfig.eslint.json' ],
      },
    },
  },
  {
    // Only the TypeScript sources are linted, as was the case before the flat config migration
    ignores: [
      'coverage',
      '**/*.js',
      '**/*.d.ts',
      '**/*.js.map',
      '**/*.json',
      '**/*.md',
      '**/*.yml',
    ],
  },
  {
    rules: {
      'no-implicit-coercion': 'off',
      // This package targets Node.js exclusively
      'import/no-nodejs-modules': 'off',
    },
  },
]);
