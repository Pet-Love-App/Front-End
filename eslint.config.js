// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*'],
  },
  {
    rules: {
      // Prettier 集成
      'prettier/prettier': 'warn',
      
      // React/React Native 规则
      'react/react-in-jsx-scope': 'off', // React 19 不需要导入 React
      'react/prop-types': 'off',          // 使用 TypeScript
      
      // 代码风格
      'no-console': 'warn',               // 警告 console
      'no-unused-vars': 'warn',           // 警告未使用的变量
      '@typescript-eslint/no-unused-vars': 'warn',
      
      // 缩进相关（让 Prettier 处理）
      'indent': 'off',
      '@typescript-eslint/indent': 'off',
    },
  },
]);