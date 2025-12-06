// https://docs.expo.dev/guides/using-eslint/
const { FlatCompat } = require('@eslint/eslintrc');
const path = require('path');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends('expo'),
  {
    ignores: ['dist/*', 'node_modules/*', 'coverage/*', '.expo/*', '*.config.js'],
  },
  {
    rules: {
      // ==================== React/React Native ====================
      'react/react-in-jsx-scope': 'off', // React 19 不需要导入 React
      'react/prop-types': 'off', // 使用 TypeScript

      // ==================== 代码质量 ====================
      'no-console': ['warn', { allow: ['error', 'warn'] }], // 允许 console.error 和 console.warn
      'prefer-const': 'warn', // 优先使用 const
      'no-var': 'error', // 禁止使用 var
      'no-debugger': 'warn', // 警告使用 debugger

      // ==================== Import 顺序 ====================
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index'],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'react-native',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['react', 'react-native'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // ==================== 缩进相关（让 Prettier 处理） ====================
      indent: 'off',
    },
  },
];
