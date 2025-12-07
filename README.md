# 🐾 Pet Love - 宠物爱好者社区（前端）

<div align="center">

**基于 Expo + React Native 打造的智能宠物社区移动应用**

[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0-000020?style=flat&logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tamagui](https://img.shields.io/badge/Tamagui-1.138.0-00A9E0?style=flat)](https://tamagui.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📖 项目简介

Pet Love 是一个功能完整的宠物社区移动应用，集成了猫粮智能分析、OCR 识别、社区互动、宠物管理等功能，为宠物爱好者提供一站式服务平台。

### ✨ 核心亮点

- 🤖 **AI 智能分析** - 基于 GPT 的猫粮配料表深度分析
- 📸 **OCR 文字识别** - 一键扫描猫粮配料表，自动提取成分信息
- 🔬 **成分数据库** - 完整的添加剂和营养成分数据库，支持百度百科查询
- 📊 **数据可视化** - 营养成分占比饼图、柱状图、数据表格展示
- 💬 **社区互动** - 论坛、评论、收藏、点赞等社交功能
- ⭐ **信誉系统** - 用户贡献度评分和徽章系统
- 🐾 **宠物管理** - 多宠物档案管理，记录宠物信息

---

## 🚀 快速开始

### 📋 前置要求

在开始之前，请确保你的开发环境已安装：

- **Node.js** >= 18.0.0 ([下载](https://nodejs.org/))
- **npm** >= 9.0.0 或 **yarn** >= 1.22.0
- **Expo CLI** (安装命令: `npm install -g expo-cli`)
- **iOS 模拟器** (macOS) 或 **Android Studio** (所有平台)

### 📥 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/Pet-Love-App/Front-End.git
cd pet-love-front_end

# 2. 安装依赖
npm install

# ⚠️ 如果遇到依赖冲突，项目已配置 .npmrc 自动使用 legacy-peer-deps
# 详细说明请查看: docs/DEPENDENCY_ISSUES.md
```

### ⚙️ 环境配置

创建 `.env` 文件（可选）：

```env
# Supabase 配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# API 配置
API_BASE_URL=http://localhost:8000
```

### 🔧 初始化 Git Hooks

```bash
# 配置自动代码格式化和提交前检查
npm run prepare
```

这会配置 Husky + lint-staged，确保每次提交前自动：
- ✅ ESLint 检查并修复代码
- ✅ Prettier 格式化代码
- ✅ Commitlint 验证提交信息格式

### 🎯 启动开发服务器

```bash
# 启动 Expo 开发服务器
npm start

# 或者直接启动特定平台
npm run ios       # iOS 模拟器
npm run android   # Android 模拟器
npm run web       # Web 浏览器
```

在终端输出中，你可以选择：
- 📱 在 **iOS 模拟器** 中打开
- 🤖 在 **Android 模拟器** 中打开
- 🌐 在 **Web 浏览器** 中打开
- 📲 使用 **Expo Go** 扫码在真机上调试

---

## 🛠️ 开发指南

### 📝 常用命令

| 命令 | 说明 |
|------|------|
| `npm start` | 启动 Expo 开发服务器 |
| `npm run lint` | 代码质量检查 |
| `npm run lint:fix` | 自动修复代码问题 |
| `npm run format` | 格式化所有文件 |
| `npm run format:check` | 检查格式化（CI 用） |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm test` | 运行测试 |
| `npm run test:coverage` | 生成测试覆盖率报告 |
| `npm run build:production` | 生产环境构建 |

### 🎨 代码规范

#### 自动格式化流程

本项目配置了**三层防护**的代码质量保障体系：

1. **编辑器层** - 保存文件时自动格式化（VSCode 配置）
2. **Git Hooks 层** - 提交前自动检查和修复（Husky + lint-staged）
3. **CI 层** - 推送后在 GitHub Actions 中再次检查

#### Commit Message 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 格式
<type>(<scope>): <subject>

# 示例
git commit -m "feat(scanner): 添加OCR识别功能"
git commit -m "fix(profile): 修复头像上传失败问题"
git commit -m "docs: 更新 README 安装步骤"
git commit -m "perf(image): 优化图片加载性能"
```

**Type 类型：**
- `feat` - 新功能
- `fix` - Bug 修复
- `docs` - 文档更新
- `style` - 代码格式调整（不影响功能）
- `refactor` - 代码重构
- `perf` - 性能优化
- `test` - 测试相关
- `chore` - 构建/工具链相关

---

## 🏗️ 技术栈

### 核心框架

| 技术 | 版本 | 说明 |
|------|------|------|
| [React Native](https://reactnative.dev/) | 0.81.5 | 跨平台移动应用框架 |
| [Expo](https://expo.dev/) | ~54.0 | React Native 开发工具链 |
| [TypeScript](https://www.typescriptlang.org/) | ~5.9 | 静态类型系统 |
| [Expo Router](https://expo.github.io/router/) | ~6.0 | 基于文件的路由系统 |

### UI & 样式

| 技术 | 说明 |
|------|------|
| [Tamagui](https://tamagui.dev/) | 跨平台 UI 组件库（React Native + Web） |
| [Expo Symbols](https://docs.expo.dev/guides/symbols/) | SF Symbols 图标库 |
| [Lottie](https://airbnb.io/lottie/) | 动画库 |
| [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) | 高性能动画库 |

### 状态管理 & 数据

| 技术 | 说明 |
|------|------|
| [Zustand](https://zustand-demo.pmnd.rs/) | 轻量级状态管理库 |
| [Supabase](https://supabase.com/) | 后端服务（认证、数据库、存储） |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | 本地持久化存储 |

### 功能模块

| 模块 | 技术 |
|------|------|
| 相机 & 图片 | Expo Camera, Expo Image Picker, Expo Image Manipulator |
| 图表 | React Native Chart Kit, React Native SVG |
| 网络请求 | Fetch API + 自定义 API Client |
| 剪贴板 | Expo Clipboard |

### 开发工具

| 工具 | 说明 |
|------|------|
| [ESLint](https://eslint.org/) | 代码质量检查 |
| [Prettier](https://prettier.io/) | 代码格式化 |
| [Husky](https://typicode.github.io/husky/) | Git Hooks 管理 |
| [lint-staged](https://github.com/okonet/lint-staged) | 暂存文件检查 |
| [Commitlint](https://commitlint.js.org/) | 提交信息规范 |
| [Jest](https://jestjs.io/) | 测试框架 |
| [Testing Library](https://testing-library.com/react-native) | React Native 测试工具 |

---

## 📁 项目结构

```
pet-love-front_end/
├── src/                           # 源代码目录
│   ├── app/                       # Expo Router 路由页面
│   │   ├── (tabs)/                # 底部导航页面
│   │   │   ├── collect/           # 收藏页
│   │   │   ├── ranking/           # 排行榜页
│   │   │   ├── scanner/           # 扫描识别页
│   │   │   ├── profile/           # 个人中心页
│   │   │   └── community/         # 社区论坛页
│   │   ├── detail/                # 详情页
│   │   │   ├── components/        # 详情页组件
│   │   │   ├── hooks/             # 详情页自定义 Hooks
│   │   │   └── screens/           # 详情页屏幕
│   │   ├── login/                 # 登录注册页
│   │   ├── index.tsx              # 根页面（认证检查）
│   │   ├── _layout.tsx            # 根布局
│   │   └── +not-found.tsx         # 404 页面
│   │
│   ├── components/                # 全局共享组件
│   │   ├── ui/                    # UI 基础组件
│   │   │   ├── IconSymbol.tsx     # 图标组件
│   │   │   ├── OptimizedImage.tsx # 优化的图片组件
│   │   │   ├── Tag.tsx            # 标签组件
│   │   │   ├── LottieAnimation.tsx # Lottie 动画组件
│   │   │   └── Skeleton.tsx       # 骨架屏组件
│   │   ├── camera-view.tsx        # 相机视图组件
│   │   └── index.ts               # 组件统一导出
│   │
│   ├── services/                  # API 服务层
│   │   ├── api/                   # API 接口封装
│   │   │   ├── ai_report/         # AI 报告 API
│   │   │   ├── ocr/               # OCR 识别 API
│   │   │   ├── search/            # 搜索 API
│   │   │   ├── client.ts          # API 客户端
│   │   │   └── index.ts           # 统一导出
│   │   └── index.ts
│   │
│   ├── lib/                       # 第三方库封装
│   │   └── supabase/              # Supabase 服务
│   │       ├── services/          # 各个业务服务
│   │       │   ├── catfood.ts     # 猫粮服务
│   │       │   ├── profile.ts     # 用户资料服务
│   │       │   ├── pet.ts         # 宠物服务
│   │       │   ├── post.ts        # 帖子服务
│   │       │   ├── comment.ts     # 评论服务
│   │       │   ├── additive.ts    # 添加剂服务
│   │       │   └── ...
│   │       ├── client.ts          # Supabase 客户端初始化
│   │       ├── helpers.ts         # 辅助函数
│   │       └── index.ts           # 统一导出
│   │
│   ├── store/                     # Zustand 状态管理
│   │   ├── userStore.ts           # 用户状态
│   │   ├── catfoodStore.ts        # 猫粮状态
│   │   └── ...
│   │
│   ├── hooks/                     # 全局自定义 Hooks
│   │   ├── useItemDetail.ts       # 成分详情 Hook
│   │   ├── useFavorite.ts         # 收藏功能 Hook
│   │   ├── useLazyLoad.ts         # 懒加载 Hook
│   │   ├── useColorScheme.ts      # 主题色 Hook
│   │   └── index.ts
│   │
│   ├── constants/                 # 常量定义
│   │   ├── Colors.ts              # 颜色常量
│   │   ├── nutrition.ts           # 营养成分配置
│   │   ├── theme.ts               # 主题配置
│   │   └── features.ts            # 功能开关
│   │
│   ├── types/                     # TypeScript 类型定义
│   │   ├── camera.ts              # 相机相关类型
│   │   ├── navigation.ts          # 导航类型
│   │   └── index.ts
│   │
│   ├── utils/                     # 工具函数
│   │   ├── logger.ts              # 日志工具
│   │   ├── format.ts              # 格式化工具
│   │   └── ...
│   │
│   └── config/                    # 配置文件
│       ├── api.ts                 # API 配置
│       └── features.ts            # 功能开关配置
│
├── assets/                        # 静态资源
│   ├── fonts/                     # 字体文件
│   ├── images/                    # 图片资源
│   ├── animations/                # Lottie 动画文件
│   └── icons/                     # 图标资源
│
├── docs/                          # 文档
│   ├── AUTO_FORMAT_GUIDE.md       # 自动格式化指南
│   ├── CONTRIBUTING.md            # 贡献指南
│   ├── CODE_REVIEW_REPORT.md      # 代码审查报告
│   ├── IMAGE_OPTIMIZATION_GUIDE.md # 图片优化指南
│   └── DEPENDENCY_ISSUES.md       # 依赖问题说明
│
├── scripts/                       # 构建脚本
│   └── optimize-lottie.js         # Lottie 动画优化脚本
│
├── .vscode/                       # VSCode 配置（团队共享）
│   ├── settings.json              # 编辑器设置
│   └── extensions.json            # 推荐扩展
│
├── .husky/                        # Husky Git Hooks 配置
│   ├── pre-commit                 # 提交前检查
│   └── commit-msg                 # 提交信息验证
│
├── app.json                       # Expo 应用配置
├── package.json                   # 项目依赖和脚本
├── tsconfig.json                  # TypeScript 配置
├── eslint.config.js               # ESLint 配置
├── .prettierrc                    # Prettier 配置
├── .gitignore                     # Git 忽略文件
├── .npmrc                         # npm 配置
└── README.md                      # 项目说明文档
```

---

## 🧪 测试

```bash
# 运行所有测试
npm test

# 监听模式运行测试
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage
```

测试文件命名规范：`*.test.ts` 或 `*.test.tsx`

---

## 📦 构建和部署

### 开发环境构建

```bash
# 构建预览
npx expo build
```

### 生产环境构建

```bash
# 导出为静态资源（所有平台）
npm run build:production

# 分析包大小
npm run analyze:bundle
```

### EAS Build（推荐）

```bash
# 安装 EAS CLI
npm install -g eas-cli

# 登录 Expo 账号
eas login

# 配置项目
eas build:configure

# 构建 iOS 应用
eas build --platform ios

# 构建 Android 应用
eas build --platform android
```

详细说明请查看：[Expo EAS Build 文档](https://docs.expo.dev/build/introduction/)

---

## 🔒 环境变量

项目支持通过 `.env` 文件配置环境变量：

```env
# Supabase 配置
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key

# API 配置
API_BASE_URL=http://localhost:8000
```

---
