/**
 * 认证流程 E2E 测试
 *
 * 测试用户登录、注册、登出等流程
 */

import { device, element, by, expect } from 'detox';
import { reloadApp } from '../init';

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await reloadApp();
  });

  describe('Login', () => {
    it('should display login screen on app launch', async () => {
      // 验证登录页面显示
      await expect(element(by.id('login-screen'))).toBeVisible();
      await expect(element(by.id('login-email-input'))).toBeVisible();
      await expect(element(by.id('login-password-input'))).toBeVisible();
      await expect(element(by.id('login-button'))).toBeVisible();
    });

    it('should show error for invalid credentials', async () => {
      // 输入无效凭据
      await element(by.id('login-email-input')).typeText('invalid@example.com');
      await element(by.id('login-password-input')).typeText('wrongpassword');
      await element(by.id('login-button')).tap();

      // 验证错误消息显示
      await expect(element(by.text('邮箱或密码错误'))).toBeVisible();
    });

    it('should navigate to home on successful login', async () => {
      // 使用测试账户登录
      await element(by.id('login-email-input')).typeText('test@petlove.com');
      await element(by.id('login-password-input')).typeText('Test123456');
      await element(by.id('login-button')).tap();

      // 验证导航到首页
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Registration', () => {
    beforeEach(async () => {
      // 导航到注册页面
      await element(by.id('register-link')).tap();
    });

    it('should display registration screen', async () => {
      await expect(element(by.id('register-screen'))).toBeVisible();
      await expect(element(by.id('register-email-input'))).toBeVisible();
      await expect(element(by.id('register-username-input'))).toBeVisible();
      await expect(element(by.id('register-password-input'))).toBeVisible();
    });

    it('should validate email format', async () => {
      await element(by.id('register-email-input')).typeText('invalid-email');
      await element(by.id('register-button')).tap();

      await expect(element(by.text('请输入有效的邮箱地址'))).toBeVisible();
    });

    it('should validate password requirements', async () => {
      await element(by.id('register-email-input')).typeText('new@example.com');
      await element(by.id('register-username-input')).typeText('newuser');
      await element(by.id('register-password-input')).typeText('12345'); // 太短

      await element(by.id('register-button')).tap();

      await expect(element(by.text('密码至少6个字符'))).toBeVisible();
    });
  });

  describe('Logout', () => {
    beforeEach(async () => {
      // 先登录
      await element(by.id('login-email-input')).typeText('test@petlove.com');
      await element(by.id('login-password-input')).typeText('Test123456');
      await element(by.id('login-button')).tap();

      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should logout and return to login screen', async () => {
      // 导航到个人中心
      await element(by.id('tab-profile')).tap();

      // 点击设置
      await element(by.id('settings-button')).tap();

      // 点击退出登录
      await element(by.id('logout-button')).tap();

      // 确认退出
      await element(by.text('确定')).tap();

      // 验证返回登录页
      await expect(element(by.id('login-screen'))).toBeVisible();
    });
  });
});
