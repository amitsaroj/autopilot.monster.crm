import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: { parser: tsParser, globals: { ...globals.node, ...globals.jest } },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs['eslint-recommended'].overrides[0].rules,
      ...tsPlugin.configs.recommended.rules,
      // Existing modules use legacy SDK types; surface them while keeping new WhatsApp code strict.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: [
      'src/modules/whatsapp/**/*.ts',
      'src/modules/whatsapp-automation/**/*.ts',
      'src/modules/workflow/**/*.ts',
    ],
    ignores: ['**/*.spec.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'error' },
  },
];
