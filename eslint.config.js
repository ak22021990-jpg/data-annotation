import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'

export default [
  { ignores: ['dist', 'google-apps-script.js'] },
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...reactRefresh.configs.vite.rules,
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Identifier[name=/flag|zone|clue|hint|classif|moderat/i]',
          message: 'Banned flagmail1 terminology. Use annotation-domain language instead.',
        },
      ],
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^(React|StrictMode|App|_)',
          argsIgnorePattern: '^_'
        }
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      globals: { ...globals.browser },
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
]
