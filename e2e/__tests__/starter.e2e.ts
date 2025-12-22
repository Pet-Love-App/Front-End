/**
 * Detox E2E 测试 - 基础测试
 * 验证应用能够正常启动和基本功能
 * 测试账号: 3157085660@qq.com / 123456
 */

import { device, element, by, expect as detoxExpect, waitFor } from 'detox';
import { TEST_USER, loginTestUser, waitForElement } from '../init';

describe('Pet Love App - Starter Tests', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
    });
    // 等待应用完全加载
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(30000);
  });

  describe('App Launch', () => {
    it('should launch app successfully', async () => {
      await detoxExpect(element(by.id('login-screen'))).toBeVisible();
    });
  });

  describe('Login Screen Elements', () => {
    it('should have email input', async () => {
      await detoxExpect(element(by.id('login-email-input'))).toBeVisible();
    });

    it('should have password input', async () => {
      await detoxExpect(element(by.id('login-password-input'))).toBeVisible();
    });

    it('should have login button', async () => {
      await detoxExpect(element(by.id('login-button'))).toBeVisible();
    });

    it('should have register link', async () => {
      await detoxExpect(element(by.id('register-link'))).toBeVisible();
    });
  });

  describe('Input Validation', () => {
    it('should allow typing in email field', async () => {
      const emailInput = element(by.id('login-email-input'));
      await emailInput.tap();
      await emailInput.typeText('test@example.com');
      await emailInput.clearText();
    });

    it('should allow typing in password field', async () => {
      const passwordInput = element(by.id('login-password-input'));
      await passwordInput.tap();
      await passwordInput.typeText('password123');
      await passwordInput.clearText();
    });
  });

  describe('Navigation', () => {
    it('should navigate to register screen', async () => {
      await element(by.id('register-link')).tap();
      await waitFor(element(by.id('register-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should navigate back to login from register', async () => {
      await element(by.id('back-button')).tap();
      await waitFor(element(by.id('login-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Login Flow', () => {
    it('should login with test credentials', async () => {
      // 登录
      await loginTestUser();

      // 验证登录成功
      await waitForElement('home-screen', 15000);
      await detoxExpect(element(by.id('home-screen'))).toBeVisible();
    });

    it('should navigate through all tabs after login', async () => {
      // 验证收藏页 (home)
      await detoxExpect(element(by.id('home-screen'))).toBeVisible();

      // 切换到论坛
      await element(by.label('tab-forum')).tap();
      await waitFor(element(by.id('forum-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // 切换到排行榜
      await element(by.label('tab-ranking')).tap();
      await waitFor(element(by.id('ranking-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // 切换到个人中心
      await element(by.label('tab-profile')).tap();
      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // 切换回收藏页
      await element(by.label('tab-collect')).tap();
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });
});
