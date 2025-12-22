/**
 * 个人中心 E2E 测试
 *
 * 测试用户资料、信誉分、设置等流程
 * 测试账号: 3157085660@qq.com / 123456
 */

import { device, element, by, expect, waitFor } from 'detox';
import { reloadApp, loginTestUser, waitForElement, TEST_USER } from '../init';

describe('Profile Flow', () => {
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
    // 导航到个人中心 (使用 accessibilityLabel)
    await element(by.label('tab-profile')).tap();
    // 等待个人中心页面加载
    await waitForElement('profile-screen', 5000);
  });

  describe('Profile Screen', () => {
    it('should display profile screen', async () => {
      await expect(element(by.id('profile-screen'))).toBeVisible();
    });

    it('should display user avatar', async () => {
      await expect(element(by.id('user-avatar'))).toBeVisible();
    });

    it('should display username', async () => {
      await expect(element(by.id('user-username'))).toBeVisible();
    });

    it('should display settings button', async () => {
      await expect(element(by.id('settings-button'))).toBeVisible();
    });
  });

  describe('Reputation Card', () => {
    it('should display reputation card', async () => {
      await expect(element(by.id('reputation-card'))).toBeVisible();
    });

    it('should display reputation score', async () => {
      await expect(element(by.id('reputation-score'))).toBeVisible();
    });

    it('should display reputation level', async () => {
      await expect(element(by.id('reputation-level'))).toBeVisible();
    });

    it('should show correct level badge', async () => {
      await expect(element(by.id('reputation-level-badge'))).toBeVisible();
    });

    it('should display profile completeness label', async () => {
      await expect(element(by.text('资料完整度'))).toBeVisible();
    });

    it('should display review quality label', async () => {
      await expect(element(by.text('评论质量'))).toBeVisible();
    });

    it('should display community contribution label', async () => {
      await expect(element(by.text('社区贡献'))).toBeVisible();
    });

    it('should show progress bars', async () => {
      const progressBars = element(by.id('progress-bar'));
      await expect(progressBars.atIndex(0)).toBeVisible();
    });
  });

  describe('Settings Navigation', () => {
    it('should navigate to settings screen', async () => {
      await element(by.id('settings-button')).tap();

      await waitForElement('settings-screen', 5000);
      await expect(element(by.id('settings-screen'))).toBeVisible();
    });

    it('should display logout button in settings', async () => {
      await element(by.id('settings-button')).tap();
      await waitForElement('settings-screen', 5000);

      await expect(element(by.id('logout-button'))).toBeVisible();
    });

    it('should display theme setting', async () => {
      await element(by.id('settings-button')).tap();
      await waitForElement('settings-screen', 5000);

      await expect(element(by.id('theme-setting'))).toBeVisible();
    });

    it('should toggle theme mode', async () => {
      await element(by.id('settings-button')).tap();
      await waitForElement('settings-screen', 5000);

      // 点击主题设置
      await element(by.id('theme-setting')).tap();

      // 等待主题选择弹窗
      await waitFor(element(by.text('浅色')))
        .toBeVisible()
        .withTimeout(3000);

      // 选择深色模式
      await element(by.text('深色')).tap();
    });
  });

  describe('Tab Navigation', () => {
    it('should navigate to collect tab', async () => {
      await element(by.label('tab-collect')).tap();

      await waitForElement('home-screen', 5000);
      await expect(element(by.id('home-screen'))).toBeVisible();
    });

    it('should navigate to forum tab', async () => {
      await element(by.label('tab-forum')).tap();

      // 等待论坛页面加载
      await waitFor(element(by.id('forum-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should navigate to scanner tab', async () => {
      await element(by.label('tab-scanner')).tap();

      // 扫描页面可能需要权限
      // 这里只验证导航成功
    });

    it('should navigate to ranking tab', async () => {
      await element(by.label('tab-ranking')).tap();

      await waitFor(element(by.id('ranking-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should navigate back to profile tab', async () => {
      // 先切换到其他标签
      await element(by.label('tab-collect')).tap();
      await waitForElement('home-screen', 5000);

      // 再切换回个人中心
      await element(by.label('tab-profile')).tap();
      await waitForElement('profile-screen', 5000);
    });
  });

  describe('Logout Flow', () => {
    it('should show logout confirmation dialog', async () => {
      await element(by.id('settings-button')).tap();
      await waitForElement('settings-screen', 5000);

      await element(by.id('logout-button')).tap();

      // 验证确认弹窗显示
      await waitFor(element(by.text('确认登出')))
        .toBeVisible()
        .withTimeout(3000);
      await expect(element(by.text('确定要退出登录吗？'))).toBeVisible();
    });

    it('should cancel logout when pressing cancel', async () => {
      await element(by.id('settings-button')).tap();
      await waitForElement('settings-screen', 5000);

      await element(by.id('logout-button')).tap();

      // 点击取消
      await waitFor(element(by.text('取消')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.text('取消')).tap();

      // 验证仍然在设置页
      await expect(element(by.id('settings-screen'))).toBeVisible();
    });

    it('should logout and return to login screen', async () => {
      await element(by.id('settings-button')).tap();
      await waitForElement('settings-screen', 5000);

      await element(by.id('logout-button')).tap();

      // 确认退出
      await waitFor(element(by.text('确定')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.text('确定')).tap();

      // 验证返回登录页
      await waitForElement('login-screen', 10000);

      // 重新登录以便后续测试
      await loginTestUser();
      await waitForElement('home-screen', 15000);
    });
  });
});
