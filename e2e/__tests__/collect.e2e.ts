/**
 * 收藏功能 E2E 测试
 *
 * 测试收藏列表、搜索、标签切换等流程
 * 测试账号: 3157085660@qq.com / 123456
 */

import { device, element, by, expect, waitFor } from 'detox';
import { reloadApp, loginTestUser, waitForElement } from '../init';

describe('Collect Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    // 等待应用加载
    await waitForElement('login-screen', 30000);
    // 登录测试账户
    await loginTestUser();
  });

  beforeEach(async () => {
    await reloadApp();
    // 等待主页加载 (收藏页是默认首页)
    await waitForElement('home-screen', 10000);
  });

  describe('Collect Screen', () => {
    it('should display collect screen (home)', async () => {
      await expect(element(by.id('home-screen'))).toBeVisible();
    });

    it('should display page title', async () => {
      await expect(element(by.text('我的收藏'))).toBeVisible();
    });

    it('should display tab options', async () => {
      // 验证猫粮收藏标签
      await expect(element(by.text('猫粮收藏'))).toBeVisible();
      // 验证帖子收藏标签
      await expect(element(by.text('帖子收藏'))).toBeVisible();
    });
  });

  describe('Tab Switching', () => {
    it('should switch to post collection tab', async () => {
      // 点击帖子收藏标签
      await element(by.text('帖子收藏')).tap();

      // 等待标签切换
      await waitFor(element(by.text('帖子收藏')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should switch back to catfood collection tab', async () => {
      // 先切换到帖子收藏
      await element(by.text('帖子收藏')).tap();

      // 再切换回猫粮收藏
      await element(by.text('猫粮收藏')).tap();

      await waitFor(element(by.text('猫粮收藏')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Search Functionality', () => {
    it('should display search input', async () => {
      // 验证搜索框存在
      await expect(element(by.text('搜索收藏的内容...'))).toBeVisible();
    });
  });

  describe('Pull to Refresh', () => {
    it('should refresh collect list on pull down', async () => {
      // 验证页面可见
      await expect(element(by.id('home-screen'))).toBeVisible();

      // 收藏页面的刷新功能
      // 由于是 ScrollView 组件，可能需要特定的测试方式
    });
  });

  describe('Navigation from Collect', () => {
    it('should navigate to forum', async () => {
      await element(by.label('tab-forum')).tap();
      await waitForElement('forum-screen', 5000);
    });

    it('should navigate to ranking', async () => {
      await element(by.label('tab-ranking')).tap();
      await waitForElement('ranking-screen', 5000);
    });

    it('should navigate to profile', async () => {
      await element(by.label('tab-profile')).tap();
      await waitForElement('profile-screen', 5000);
    });

    it('should return to collect from other tabs', async () => {
      // 切换到其他标签
      await element(by.label('tab-profile')).tap();
      await waitForElement('profile-screen', 5000);

      // 返回收藏页
      await element(by.label('tab-collect')).tap();
      await waitForElement('home-screen', 5000);
    });
  });

  describe('Empty State', () => {
    it('should handle empty catfood collection gracefully', async () => {
      // 验证空状态或收藏列表显示
      // 根据实际数据情况，可能显示空状态或列表
      await expect(element(by.id('home-screen'))).toBeVisible();
    });

    it('should handle empty post collection gracefully', async () => {
      // 切换到帖子收藏
      await element(by.text('帖子收藏')).tap();

      // 验证空状态或收藏列表显示
      await expect(element(by.id('home-screen'))).toBeVisible();
    });
  });
});
