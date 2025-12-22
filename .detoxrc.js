/**
 * Detox E2E 测试配置
 *
 * Windows 环境配置：
 * - Android: 使用 expo prebuild + gradle 构建
 * - iOS: 不支持（需要 macOS）
 */

/** @type {Detox.DetoxConfig} */
module.exports = {
  logger: {
    level: process.env.CI ? 'debug' : 'info',
  },
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 300000, // 5 分钟，新架构需要更长启动时间
    },
  },
  apps: {
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      testBinaryPath: 'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
      build: 'cd android && gradlew.bat assembleDebug assembleAndroidTest -DtestBuildType=debug',
      // 启动参数 - 使用内嵌 bundle 而不是 Metro
      launchArgs: {
        detoxURLBlacklistRegex: '.*bundle.*',
      },
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      testBinaryPath:
        'android/app/build/outputs/apk/androidTest/release/app-release-androidTest.apk',
      build:
        'cd android && gradlew.bat assembleRelease assembleAndroidTest -DtestBuildType=release',
    },
  },
  devices: {
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel',
      },
    },
  },
  configurations: {
    // Debug 配置 - 需要 Metro bundler 运行
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
    // Release 配置 - 推荐用于 E2E 测试（无需 Metro）
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release',
    },
  },
  behavior: {
    init: {
      exposeGlobals: true,
    },
    launchApp: 'auto',
    cleanup: {
      shutdownDevice: false,
    },
  },
};
