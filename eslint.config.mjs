import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import astro from 'eslint-plugin-astro'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: [
      'dist/**',
      '.astro/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-recommended'],
  {
    plugins: { '@stylistic': stylistic },
    rules: {
      '@stylistic/semi': ['warn', 'never'],
      '@stylistic/member-delimiter-style': [
        'warn',
        {
          multiline: { delimiter: 'none' },
          singleline: { delimiter: 'comma', requireLast: false },
        },
      ],
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-duplicate-imports': 'error',
      'no-console': 'error',
    },
  },
  {
    files: ['tests/browser/**/*.mjs'],
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
        getComputedStyle: 'readonly',
      },
    },
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
  },
]
