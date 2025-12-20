/**
 * Detox E2E 测试 - 基础测试
 * 验证应用能够正常启动和基本功能
 */

import { device, element, by, expect as detoxExpect } from 'detox';

describe('Pet Love App - Starter Tests', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES', camera: 'YES', photos: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('App Launch', () => {
    it('should launch app successfully', async () => {
      // 应用应该能够启动
      await detoxExpect(element(by.id('app-root'))).toExist();
    });

    it('should show login screen on first launch', async () => {
      // 未登录时应该显示登录页面
      await detoxExpect(element(by.id('login-screen'))).toBeVisible();
    });
  });

  describe('Login Screen', () => {
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
      await element(by.id('login-email-input')).typeText('test@example.com');
      await detoxExpect(element(by.id('login-email-input'))).toHaveText('test@example.com');
    });

    it('should allow typing in password field', async () => {
      await element(by.id('login-password-input')).typeText('password123');
      // Password field 通常不显示文本，所以不验证 text
      await detoxExpect(element(by.id('login-password-input'))).toExist();
    });

    it('should clear email input', async () => {
      await element(by.id('login-email-input')).typeText('test@example.com');
      await element(by.id('login-email-input')).clearText();
      await detoxExpect(element(by.id('login-email-input'))).toHaveText('');
    });
  });

  describe('Navigation', () => {
    it('should navigate to register screen', async () => {
      await element(by.id('register-link')).tap();
      await detoxExpect(element(by.id('register-screen'))).toBeVisible();
    });

    it('should navigate back from register', async () => {
      await element(by.id('register-link')).tap();
      await detoxExpect(element(by.id('register-screen'))).toBeVisible();

      await element(by.id('back-button')).tap();
      await detoxExpect(element(by.id('login-screen'))).toBeVisible();
    });
  });
});
