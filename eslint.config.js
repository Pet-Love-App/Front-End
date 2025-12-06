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
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // ==================== Import 顺序 ====================
      'import/order': [
        'warn',
        {
          groups: [
            'builtin', // Node.js 内置模块
            'external', // npm 包
            'internal', // 内部别名导入 (@/...)
            ['parent', 'sibling'], // 相对路径 (../, ./)
            'index', // 当前目录
            'type', // TypeScript 类型导入
          ],
          pathGroups: [
            // 1. React 核心 - 最优先
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'react-*',
              group: 'external',
              position: 'before',
            },
            // 2. React Native 核心
            {
              pattern: 'react-native',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'react-native-*',
              group: 'external',
              position: 'before',
            },
            // 3. Expo 相关
            {
              pattern: 'expo',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'expo-*',
              group: 'external',
              position: 'before',
            },
            // 4. UI 库 (Tamagui 等)
            {
              pattern: '@tamagui/**',
              group: 'external',
              position: 'after',
            },
            {
              pattern: 'tamagui',
              group: 'external',
              position: 'after',
            },
            // 5. 内部模块 - 按层级分组
            {
              pattern: '@/src/app/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@/src/components/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@/src/constants/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@/src/hooks/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@/src/lib/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@/src/services/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@/src/store/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@/src/types/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@/src/utils/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@/src/**',
              group: 'internal',
              position: 'before',
            },
            // 6. 样式和资源
            {
              pattern: '*.css',
              group: 'index',
              position: 'after',
            },
            {
              pattern: '*.scss',
              group: 'index',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['react', 'react-native'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          distinctGroup: false,
          warnOnUnassignedImports: false,
        },
      ],

      // ==================== 缩进相关（让 Prettier 处理） ====================
      indent: 'off',
    },
  },
];
