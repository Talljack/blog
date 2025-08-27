const { FlatCompat } = require('@eslint/eslintrc')

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      '.vercel/**',
      'public/**',
      '*.config.*',
      'playwright.config.ts',
    ],
  },
]
