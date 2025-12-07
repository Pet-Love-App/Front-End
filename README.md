# Pet Love - 宠物爱好者社区 🐾

这是一个基于 Expo + React Native 的宠物社区应用。

## 🚀 快速开始

### 1. 克隆项目并安装依赖

```bash
git clone <repository-url>
cd pet-love-front_end
npm install
```

**注意**：项目已配置 `.npmrc` 文件，会自动使用 `legacy-peer-deps` 解决 Expo 生态系统中的依赖冲突。如果遇到依赖问题，请查看 [依赖问题说明](./docs/DEPENDENCY_ISSUES.md)。

### 2. **重要！初始化 Git Hooks**

```bash
npm run prepare
```

这会配置自动代码格式化和提交前检查，确保代码质量。

### 3. 启动开发服务器

```bash
npx expo start
```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## 📝 开发规范

### 自动格式化流程

本项目配置了完整的自动格式化流程，包含三层防护：

1. **编辑器层**：保存文件时自动格式化（VSCode）
2. **Git Hooks 层**：提交前自动检查和修复
3. **CI 层**：推送后在 GitHub Actions 中再次检查

详细说明请查看：[自动格式化指南](./docs/AUTO_FORMAT_GUIDE.md)

### Commit Message 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 格式
<type>(<scope>): <subject>

# 示例
git commit -m "feat: 添加用户登录功能"
git commit -m "fix: 修复头像上传失败问题"
git commit -m "docs: 更新 README"
```

类型包括：`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

详细说明请查看：[贡献指南](./docs/CONTRIBUTING.md)

### 常用命令

```bash
# 代码检查
npm run lint

# 自动修复代码问题
npm run lint:fix

# 格式化所有文件
npm run format

# TypeScript 类型检查
npm run typecheck

# 运行测试
npm test
```

## 📚 文档

- [自动格式化流程指南](./docs/AUTO_FORMAT_GUIDE.md) - 详细的自动化配置说明
- [开发贡献指南](./docs/CONTRIBUTING.md) - 开发规范和工作流程
- [代码审查报告](./docs/CODE_REVIEW_REPORT.md) - 代码质量改进记录
- [图片优化指南](./docs/IMAGE_OPTIMIZATION_GUIDE.md) - 性能优化指南

## 🛠️ 技术栈

- **框架**: Expo + React Native
- **语言**: TypeScript
- **UI 库**: Tamagui
- **状态管理**: Zustand
- **路由**: Expo Router
- **数据库**: Supabase
- **代码质量**: ESLint + Prettier + Husky
- **CI/CD**: GitHub Actions
