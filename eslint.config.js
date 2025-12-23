// https://docs.expo.dev/guides/using-eslint/
const { FlatCompat } = require('@eslint/eslintrc');
const path = require('path');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends('expo'),
  {
    ignores: ['dist/*', 'node_modules/*', 'coverage/*', '.expo/*', '*.config.js', 'supabase-mcp/*'],
  },
  {
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
  },
  {
    rules: {
      // ==================== React/React Native ====================
      'react/react-in-jsx-scope': 'off', // React 19 不需要导入 React
      'react/prop-types': 'off', // 使用 TypeScript
      'react/display-name': 'off', // 允许匿名组件
      'react/no-unknown-property': [
        'error',
        { ignore: ['testID', 'accessibilityLabel', 'accessibilityHint', 'accessibilityRole'] },
      ], // 允许 React Native 属性

      // ==================== 代码质量 ====================
      'no-console': 'off', // 允许 console
      'prefer-const': 'off', // 不强制使用 const
      'no-var': 'warn', // 警告使用 var
      'no-debugger': 'warn', // 警告使用 debugger
      'no-unused-vars': 'off', // 关闭基础规则，使用 TypeScript 版本
      '@typescript-eslint/no-unused-vars': 'off', // 关闭未使用变量检查
      '@typescript-eslint/no-empty-object-type': 'off', // 允许空对象类型
      '@typescript-eslint/no-explicit-any': 'off', // 允许使用 any
      '@typescript-eslint/no-require-imports': 'off', // 允许 require 导入
      '@typescript-eslint/ban-ts-comment': 'off', // 允许 @ts-ignore 等注释

      // ==================== React Hooks ====================
      'react-hooks/rules-of-hooks': 'error', // Hooks 调用规则（保持严格）
      'react-hooks/exhaustive-deps': 'off', // 关闭依赖数组检查

      // ==================== Import 顺序 ====================
      'import/order': 'off', // 关闭 import 顺序检查
      'import/no-unresolved': 'off', // 关闭未解析导入检查
      'import/namespace': 'off', // 关闭命名空间检查

      // ==================== 其他 ====================
      indent: 'off', // 让 Prettier 处理缩进
      'no-empty': 'off', // 允许空代码块
      'no-empty-pattern': 'off', // 允许空解构
    },
  },
];
