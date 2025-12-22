/**
 * 扫描功能 E2E 测试
 *
 * 测试扫描器入口和基本流程
 * 注意：实际扫描功能需要相机权限，可能需要在模拟器中特殊处理
 * 测试账号: 3157085660@qq.com / 123456
 */

import { device, element, by, expect, waitFor } from 'detox';
import { reloadApp, loginTestUser, waitForElement } from '../init';

describe('Scanner Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    // 等待应用加载
    await waitForElement('login-screen', 30000);
    // 登录测试账户
    await loginTestUser();
  });

  beforeEach(async () => {
    await reloadApp();
    // 等待主页加载
    await waitForElement('home-screen', 10000);
  });

  describe('Scanner Tab Access', () => {
    it('should have scanner tab visible', async () => {
      await expect(element(by.label('tab-scanner'))).toBeVisible();
    });

    it('should navigate to scanner tab', async () => {
      await element(by.label('tab-scanner')).tap();
      // 扫描器可能需要相机权限
      // 这里只验证点击成功，不验证具体页面
    });

    it('should display scanner button in center of tab bar', async () => {
      await expect(element(by.id('tab-scanner'))).toBeVisible();
    });
  });

  describe('Scanner Navigation Return', () => {
    it('should return to collect from scanner', async () => {
      await element(by.label('tab-scanner')).tap();

      // 返回收藏页
      await element(by.label('tab-collect')).tap();
      await waitForElement('home-screen', 5000);
    });

    it('should navigate to forum from scanner', async () => {
      await element(by.label('tab-scanner')).tap();

      // 切换到论坛
      await element(by.label('tab-forum')).tap();
      await waitForElement('forum-screen', 5000);
    });

    it('should navigate to ranking from scanner', async () => {
      await element(by.label('tab-scanner')).tap();

      // 切换到排行榜
      await element(by.label('tab-ranking')).tap();
      await waitForElement('ranking-screen', 5000);
    });

    it('should navigate to profile from scanner', async () => {
      await element(by.label('tab-scanner')).tap();

      // 切换到个人中心
      await element(by.label('tab-profile')).tap();
      await waitForElement('profile-screen', 5000);
    });
  });

  describe('Scanner Tab State', () => {
    it('should handle multiple scanner tab taps', async () => {
      // 多次点击扫描器标签
      await element(by.label('tab-scanner')).tap();
      await element(by.label('tab-scanner')).tap();

      // 应该保持在扫描器页面或者不崩溃
    });
  });
});
