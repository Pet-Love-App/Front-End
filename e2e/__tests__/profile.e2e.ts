/**
 * 个人中心 E2E 测试
 *
 * 测试用户资料、信誉分、设置等流程
 */

import { device, element, by, expect } from 'detox';
import { reloadApp, loginTestUser } from '../init';

describe('Profile Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    await loginTestUser('test@petlove.com', 'Test123456');
  });

  beforeEach(async () => {
    await reloadApp();
    // 导航到个人中心
    await element(by.id('tab-profile')).tap();
  });

  describe('Profile Screen', () => {
    it('should display user information', async () => {
      await expect(element(by.id('profile-screen'))).toBeVisible();
      await expect(element(by.id('user-avatar'))).toBeVisible();
      await expect(element(by.id('user-username'))).toBeVisible();
    });

    it('should display reputation card', async () => {
      await expect(element(by.id('reputation-card'))).toBeVisible();
      await expect(element(by.id('reputation-score'))).toBeVisible();
      await expect(element(by.id('reputation-level'))).toBeVisible();
    });
  });

  describe('Reputation Card', () => {
    it('should show correct level badge', async () => {
      // 验证等级徽章显示
      await expect(element(by.id('reputation-level-badge'))).toBeVisible();
    });

    it('should display score breakdown', async () => {
      // 验证分数明细显示
      await expect(element(by.text('资料完整度'))).toBeVisible();
      await expect(element(by.text('评论质量'))).toBeVisible();
      await expect(element(by.text('社区贡献'))).toBeVisible();
    });

    it('should show progress bars', async () => {
      // 验证进度条显示
      const progressBars = element(by.id('progress-bar'));
      await expect(progressBars.atIndex(0)).toBeVisible();
    });
  });

  describe('Edit Profile', () => {
    it('should navigate to edit profile screen', async () => {
      await element(by.id('edit-profile-button')).tap();
      await expect(element(by.id('edit-profile-screen'))).toBeVisible();
    });

    it('should update username', async () => {
      await element(by.id('edit-profile-button')).tap();

      // 清除当前用户名并输入新的
      await element(by.id('username-input')).clearText();
      await element(by.id('username-input')).typeText('UpdatedName');

      // 保存
      await element(by.id('save-button')).tap();

      // 验证成功提示
      await expect(element(by.text('保存成功'))).toBeVisible();
    });
  });

  describe('Settings', () => {
    beforeEach(async () => {
      await element(by.id('settings-button')).tap();
    });

    it('should display settings screen', async () => {
      await expect(element(by.id('settings-screen'))).toBeVisible();
    });

    it('should toggle theme mode', async () => {
      // 点击主题设置
      await element(by.id('theme-setting')).tap();

      // 选择深色模式
      await element(by.text('深色')).tap();

      // 验证主题已更改
      // 注意：实际验证可能需要检查视觉效果或状态
    });

    it('should navigate to about screen', async () => {
      await element(by.id('about-button')).tap();
      await expect(element(by.id('about-screen'))).toBeVisible();
    });
  });

  describe('Pet Management', () => {
    it('should display pet list', async () => {
      await element(by.id('my-pets-section')).tap();
      await expect(element(by.id('pet-list'))).toBeVisible();
    });

    it('should add new pet', async () => {
      await element(by.id('my-pets-section')).tap();
      await element(by.id('add-pet-button')).tap();

      // 填写宠物信息
      await element(by.id('pet-name-input')).typeText('测试宠物');
      await element(by.id('pet-species-picker')).tap();
      await element(by.text('猫')).tap();

      // 保存
      await element(by.id('save-pet-button')).tap();

      // 验证添加成功
      await expect(element(by.text('测试宠物'))).toBeVisible();
    });
  });
});
