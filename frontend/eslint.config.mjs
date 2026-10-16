import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default [
  ...nextVitals,
  ...nextTypescript,
  { ignores: ['.next*/**', 'node_modules/**', 'coverage/**', 'out/**', 'next-env.d.ts'] },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      // Keep legacy migration findings visible; WhatsApp paths below enforce these as errors.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
      'react/display-name': 'warn',
      'react/no-unescaped-entities': 'warn',
    },
  },
  {
    files: [
      'src/app/(app)/whatsapp/**/*.{ts,tsx}',
      'src/components/whatsapp/**/*.{ts,tsx}',
      'src/services/whatsapp*.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'react-hooks/set-state-in-effect': 'error',
      'react-hooks/purity': 'error',
      'react-hooks/refs': 'error',
      'react/display-name': 'error',
      'react/no-unescaped-entities': 'error',
    },
  },
];
