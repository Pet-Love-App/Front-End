/**
 * Expo Config Plugin: 添加 Android 网络安全配置
 * 允许对特定域名/IP 使用 HTTP 明文流量
 *
 * 解决问题：生产 APK 中 HTTP 请求被 Android 网络安全策略阻止
 */

const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const { writeFileSync, mkdirSync, existsSync } = require('fs');
const { resolve, dirname } = require('path');

/**
 * 网络安全配置 XML 内容
 * 明确允许对 82.157.255.92 使用 HTTP
 */
const NETWORK_SECURITY_CONFIG = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- 默认配置：允许明文流量（用于开发） -->
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>

    <!-- 特定域名配置 -->
    <domain-config cleartextTrafficPermitted="true">
        <!-- 你的 API 服务器 IP -->
        <domain includeSubdomains="false">82.157.255.92</domain>
        <!-- 本地开发 -->
        <domain includeSubdomains="false">localhost</domain>
        <domain includeSubdomains="false">127.0.0.1</domain>
        <domain includeSubdomains="false">10.0.2.2</domain>
    </domain-config>
</network-security-config>
`;

/**
 * 写入网络安全配置文件
 */
function writeNetworkSecurityConfig(projectRoot) {
  const configDir = resolve(projectRoot, 'android/app/src/main/res/xml');
  const configPath = resolve(configDir, 'network_security_config.xml');

  // 确保目录存在
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  writeFileSync(configPath, NETWORK_SECURITY_CONFIG);
  console.log('✅ Created network_security_config.xml');
}

/**
 * 修改 AndroidManifest.xml 引用网络安全配置
 */
function withNetworkSecurityManifest(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application?.[0];

    if (application) {
      // 添加网络安全配置引用
      application.$['android:networkSecurityConfig'] = '@xml/network_security_config';
      // 确保 usesCleartextTraffic 也设置了
      application.$['android:usesCleartextTraffic'] = 'true';
      console.log('✅ Updated AndroidManifest.xml with network security config');
    }

    return config;
  });
}

/**
 * 主插件函数
 */
function withNetworkSecurityConfig(config) {
  // 1. 修改 Manifest
  config = withNetworkSecurityManifest(config);

  // 2. 写入配置文件
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      writeNetworkSecurityConfig(config.modRequest.projectRoot);
      return config;
    },
  ]);

  return config;
}

module.exports = withNetworkSecurityConfig;
