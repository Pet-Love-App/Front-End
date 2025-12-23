// Metro 配置 - 优化包大小和构建性能
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 生产环境优化
if (process.env.NODE_ENV === 'production') {
  // 启用代码压缩
  config.transformer = {
    ...config.transformer,
    minifierConfig: {
      keep_classnames: false,
      keep_fnames: false,
      mangle: {
        keep_classnames: false,
        keep_fnames: false,
      },
      compress: {
        drop_console: true, // 移除 console.log
        drop_debugger: true, // 移除 debugger
        pure_funcs: ['console.info', 'console.debug', 'console.warn'], // 移除特定 console 调用
      },
      output: {
        comments: false, // 移除注释
        ascii_only: true,
      },
    },
  };
}

// 优化资源解析
config.resolver = {
  ...config.resolver,
  // 指定支持的文件扩展名
  sourceExts: [...config.resolver.sourceExts, 'mjs', 'cjs'],
  // 资源文件扩展名
  assetExts: [...config.resolver.assetExts.filter((ext) => ext !== 'svg'), 'lottie'],
  // 排除测试文件（所有环境）
  blockList: [
    // 排除所有测试文件和测试目录
    /\/__tests__\/.*/,
    /\/_tests_\/.*/,
    /\.test\.(ts|tsx|js|jsx)$/,
    /\.spec\.(ts|tsx|js|jsx)$/,
    /\.e2e\.(ts|tsx|js|jsx)$/,
    // 排除 Jest 配置和设置文件
    /jest\.config\.js$/,
    /jest-setup\.(ts|js)$/,
    // 排除文档和笔记本
    /\.md$/,
    /\.ipynb$/,
    // 排除 E2E 测试目录
    /\/e2e\//,
  ],
};

module.exports = config;
