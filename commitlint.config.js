module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能 (feature)
        'fix', // 修复 bug
        'docs', // 文档更新
        'style', // 代码格式调整（不影响功能）
        'refactor', // 重构（既不是新功能也不是修复 bug）
        'perf', // 性能优化
        'test', // 添加或修改测试
        'chore', // 构建过程或辅助工具的变动
        'revert', // 回滚之前的 commit
        'build', // 构建系统或外部依赖的变动
        'ci', // CI 配置文件和脚本的变动
      ],
    ],
    'subject-case': [0], // 允许任意大小写
  },
};
