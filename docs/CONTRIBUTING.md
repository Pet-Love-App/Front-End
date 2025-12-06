# 开发规范

欢迎贡献代码！请遵循以下规范以保持代码质量和一致性。

---

## 🚀 快速开始

### 1. 克隆项目并安装依赖

```bash
git clone <repository-url>
cd pet-love-front_end
npm install
```

### 2. 初始化 Git Hooks（重要！）

```bash
npm run prepare
```

这会自动配置 pre-commit 和 commit-msg hooks，确保代码提交前自动格式化和检查。

---

## 📝 Commit Message 规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### 格式

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Type 类型

| Type       | 说明                   | 示例                        |
| ---------- | ---------------------- | --------------------------- |
| `feat`     | 新功能                 | `feat: 添加用户登录功能`    |
| `fix`      | 修复 bug               | `fix: 修复头像上传失败问题` |
| `docs`     | 文档更新               | `docs: 更新 README`         |
| `style`    | 代码格式（不影响功能） | `style: 格式化代码`         |
| `refactor` | 重构                   | `refactor: 重构用户服务层`  |
| `perf`     | 性能优化               | `perf: 优化图片加载性能`    |
| `test`     | 测试                   | `test: 添加用户登录测试`    |
| `chore`    | 构建/工具变动          | `chore: 更新依赖版本`       |

### 示例

```bash
# ✅ 好的 commit message
git commit -m "feat: 添加猫粮收藏功能"
git commit -m "fix: 修复评论列表加载失败问题"
git commit -m "docs: 更新开发文档"

# ❌ 不好的 commit message
git commit -m "update"
git commit -m "修改了一些东西"
git commit -m "fix bug"
```

---

## 💻 代码规范

### ESLint + Prettier

项目已配置 ESLint 和 Prettier，保存文件时会自动格式化。

#### 手动运行

```bash
# 检查代码
npm run lint

# 自动修复
npm run lint:fix

# 格式化所有文件
npm run format

# 类型检查
npm run typecheck
```

### 代码风格

1. **使用 TypeScript**
   - 不使用 `any` 类型
   - 为函数参数和返回值添加类型注解
   - 使用接口定义数据结构

2. **命名规范**
   - 组件：PascalCase (`UserProfile.tsx`)
   - 函数/变量：camelCase (`getUserProfile`)
   - 常量：UPPER_SNAKE_CASE (`API_BASE_URL`)
   - 文件名：kebab-case (`user-profile.ts`) 或 PascalCase (`UserProfile.tsx`)

3. **导入顺序**（自动排序）

   ```typescript
   // 1. React
   import React, { useState } from 'react';

   // 2. React Native / Expo
   import { View, Text } from 'react-native';

   // 3. 第三方库
   import { Button } from 'tamagui';

   // 4. 内部模块
   import { useUserStore } from '@/src/store/userStore';

   // 5. 类型
   import type { User } from '@/src/types';
   ```

---

## 🔄 开发流程

### 1. 创建功能分支

```bash
git checkout -b feature/new-feature
# 或
git checkout -b fix/bug-fix
```

### 2. 编写代码

- 保存文件时自动格式化 ✅
- 遵循 TypeScript 和 ESLint 规范

### 3. 提交代码

```bash
git add .
git commit -m "feat: 添加新功能"
```

**会自动执行**：

1. ESLint 检查并自动修复
2. Prettier 格式化
3. Commit message 格式检查

**如果有错误**：

- 提交会被阻止
- 查看错误信息并修复
- 重新提交

### 4. 推送代码

```bash
git push origin feature/new-feature
```

**会自动执行**：

- GitHub Actions CI
  - ESLint 检查
  - TypeScript 类型检查
  - 代码格式检查

### 5. 创建 Pull Request

- 确保 CI 通过 ✅
- 请求代码审查
- 合并到主分支

---

## 🚫 绕过检查（不推荐）

紧急情况下可以绕过 pre-commit 检查：

```bash
git commit --no-verify -m "hotfix: 紧急修复"
```

**注意**：CI 仍然会检查，建议尽快修复问题。

---

## 🐛 常见问题

### Q: Husky hooks 不工作？

```bash
# 重新初始化
npm run prepare

# Windows 用户可能需要
npx husky install
```

### Q: 提交被阻止但不知道为什么？

```bash
# 查看详细错误
npm run lint

# 查看格式问题
npm run format:check

# 查看类型错误
npm run typecheck
```

### Q: 如何禁用某行的 ESLint 规则？

```typescript
// eslint-disable-next-line rule-name
const x = someFunction();

// 或者禁用整个文件
/* eslint-disable rule-name */
```

---

## 📚 参考资料

- [自动格式化流程指南](./AUTO_FORMAT_GUIDE.md)
- [代码审查报告](./CODE_REVIEW_REPORT.md)
- [图片优化指南](./IMAGE_OPTIMIZATION_GUIDE.md)

---

**有问题？** 查看文档或联系团队成员！
