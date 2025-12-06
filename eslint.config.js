// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  prettierConfig, // Prettier config 关闭冲突规则
  {
    ignores: ['dist/*', 'node_modules/*', 'coverage/*', '.expo/*'],
  },
  {
    rules: {
      // ==================== Prettier (通过 eslint-config-prettier 处理) ====================
      // 注意: 不需要 prettier/prettier 规则，Prettier 作为独立工具运行

      // ==================== React/React Native ====================
      'react/react-in-jsx-scope': 'off', // React 19 不需要导入 React
      'react/prop-types': 'off', // 使用 TypeScript
      'react-hooks/rules-of-hooks': 'error', // 检查 Hooks 规则
      'react-hooks/exhaustive-deps': 'warn', // 检查 Effect 依赖

      // ==================== TypeScript ====================
      'no-unused-vars': 'off', // 关闭 JS 规则，使用 TS 规则
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_', // 忽略 _开头的参数
          varsIgnorePattern: '^_', // 忽略 _开头的变量
          caughtErrorsIgnorePattern: '^_', // 忽略 _开头的错误
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn', // 警告使用 any
      '@typescript-eslint/no-non-null-assertion': 'warn', // 警告使用非空断言
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],

      // ==================== 代码质量 ====================
      'no-console': ['warn', { allow: ['error'] }], // 允许 console.error
      'prefer-const': 'warn', // 优先使用 const
      'no-var': 'error', // 禁止使用 var
      eqeqeq: ['warn', 'always'], // 强制使用 === 和 !==
      curly: ['warn', 'all'], // 强制所有控制语句使用大括号
      'no-debugger': 'warn', // 警告使用 debugger

      // ==================== 缩进相关（让 Prettier 处理） ====================
      indent: 'off',
      '@typescript-eslint/indent': 'off',
    },
  },
]);
