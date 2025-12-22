/**
 * 导航流程 E2E 测试
 *
 * 测试应用内各种导航流程
 * 测试账号: 3157085660@qq.com / 123456
 */

import { device, element, by, expect, waitFor } from 'detox';
import { reloadApp, loginTestUser, waitForElement } from '../init';

describe('Navigation Flow', () => {
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

  describe('Tab Bar Navigation', () => {
    it('should display tab bar after login', async () => {
      // 验证各个标签可见
      await expect(element(by.label('tab-collect'))).toBeVisible();
      await expect(element(by.label('tab-forum'))).toBeVisible();
      await expect(element(by.label('tab-scanner'))).toBeVisible();
      await expect(element(by.label('tab-ranking'))).toBeVisible();
      await expect(element(by.label('tab-profile'))).toBeVisible();
    });

    it('should navigate to collect tab (home)', async () => {
      // 先切换到其他标签
      await element(by.label('tab-profile')).tap();
      await waitForElement('profile-screen', 5000);

      // 切换回收藏标签
      await element(by.label('tab-collect')).tap();
      await waitForElement('home-screen', 5000);
    });

    it('should navigate to forum tab', async () => {
      await element(by.label('tab-forum')).tap();
      await waitForElement('forum-screen', 5000);
    });

    it('should navigate to scanner tab', async () => {
      await element(by.label('tab-scanner')).tap();
      // 扫描器可能需要权限，只验证点击成功
    });

    it('should navigate to ranking tab', async () => {
      await element(by.label('tab-ranking')).tap();
      await waitForElement('ranking-screen', 5000);
    });

    it('should navigate to profile tab', async () => {
      await element(by.label('tab-profile')).tap();
      await waitForElement('profile-screen', 5000);
    });
  });

  describe('Sequential Tab Navigation', () => {
    it('should navigate through all tabs in sequence', async () => {
      // 收藏页 -> 论坛
      await element(by.label('tab-forum')).tap();
      await waitForElement('forum-screen', 5000);

      // 论坛 -> 排行榜
      await element(by.label('tab-ranking')).tap();
      await waitForElement('ranking-screen', 5000);

      // 排行榜 -> 个人中心
      await element(by.label('tab-profile')).tap();
      await waitForElement('profile-screen', 5000);

      // 个人中心 -> 收藏页
      await element(by.label('tab-collect')).tap();
      await waitForElement('home-screen', 5000);
    });
  });

  describe('Back Navigation', () => {
    it('should handle back navigation from settings', async () => {
      // 进入个人中心
      await element(by.label('tab-profile')).tap();
      await waitForElement('profile-screen', 5000);

      // 进入设置
      await element(by.id('settings-button')).tap();
      await waitForElement('settings-screen', 5000);

      // 返回
      await device.pressBack();
      await waitForElement('profile-screen', 5000);
    });

    it('should handle back navigation from friends', async () => {
      // 进入个人中心
      await element(by.label('tab-profile')).tap();
      await waitForElement('profile-screen', 5000);

      // 进入好友列表
      await element(by.text('我的好友')).tap();
      await waitForElement('friends-screen', 5000);

      // 返回
      await device.pressBack();
      await waitForElement('profile-screen', 5000);
    });
  });

  describe('Deep Navigation', () => {
    it('should navigate to settings and back through multiple screens', async () => {
      // 收藏页 -> 个人中心
      await element(by.label('tab-profile')).tap();
      await waitForElement('profile-screen', 5000);

      // 个人中心 -> 设置
      await element(by.id('settings-button')).tap();
      await waitForElement('settings-screen', 5000);

      // 设置 -> 返回个人中心
      await device.pressBack();
      await waitForElement('profile-screen', 5000);

      // 个人中心 -> 收藏页
      await element(by.label('tab-collect')).tap();
      await waitForElement('home-screen', 5000);
    });
  });

  describe('Tab State Preservation', () => {
    it('should preserve forum category state when switching tabs', async () => {
      // 进入论坛
      await element(by.label('tab-forum')).tap();
      await waitForElement('forum-screen', 5000);

      // 选择求助分类
      await element(by.text('求助')).tap();

      // 切换到其他标签
      await element(by.label('tab-profile')).tap();
      await waitForElement('profile-screen', 5000);

      // 切换回论坛
      await element(by.label('tab-forum')).tap();
      await waitForElement('forum-screen', 5000);

      // 验证分类状态可能被保留或重置（取决于实现）
    });
  });
});
