/**
 * 认证流程 E2E 测试
 *
 * 测试用户登录、注册、登出等流程
 * 测试账号: 3157085660@qq.com / 123456
 */

import { device, element, by, expect, waitFor } from 'detox';
import { reloadApp } from '../init';

// 测试账户配置
const TEST_USER = {
  email: '3157085660@qq.com',
  password: '123456',
};

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    // 等待应用加载完成
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(30000);
  });

  beforeEach(async () => {
    await reloadApp();
    // 等待登录页面显示
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });

  describe('Login', () => {
    it('should display login screen on app launch', async () => {
      // 验证登录页面显示
      await expect(element(by.id('login-screen'))).toBeVisible();
      await expect(element(by.id('login-email-input'))).toBeVisible();
      await expect(element(by.id('login-password-input'))).toBeVisible();
      await expect(element(by.id('login-button'))).toBeVisible();
    });

    it('should display register link', async () => {
      await expect(element(by.id('register-link'))).toBeVisible();
    });

    it('should show error for invalid credentials', async () => {
      // 输入无效凭据
      await element(by.id('login-email-input')).typeText('invalid@example.com');
      await element(by.id('login-password-input')).typeText('wrongpassword');
      await element(by.id('login-button')).tap();

      // 等待错误消息显示 (可能是 toast 或其他形式)
      await waitFor(element(by.text('邮箱或密码错误')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should navigate to home on successful login', async () => {
      // 使用测试账户登录
      await element(by.id('login-email-input')).typeText(TEST_USER.email);
      await element(by.id('login-password-input')).typeText(TEST_USER.password);
      await element(by.id('login-button')).tap();

      // 验证导航到首页 (收藏页)
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(15000);
    });

    it('should clear inputs after failed login attempt', async () => {
      // 输入无效凭据
      await element(by.id('login-email-input')).typeText('invalid@example.com');
      await element(by.id('login-password-input')).typeText('wrongpassword');
      await element(by.id('login-button')).tap();

      // 等待错误显示后，清除输入重试
      await waitFor(element(by.text('邮箱或密码错误')))
        .toBeVisible()
        .withTimeout(10000);

      // 清除输入
      await element(by.id('login-email-input')).clearText();
      await element(by.id('login-password-input')).clearText();

      // 验证输入框仍然可用
      await expect(element(by.id('login-email-input'))).toBeVisible();
    });
  });

  describe('Registration', () => {
    beforeEach(async () => {
      // 导航到注册页面
      await element(by.id('register-link')).tap();
      // 等待注册页面显示
      await waitFor(element(by.id('register-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display registration screen', async () => {
      await expect(element(by.id('register-screen'))).toBeVisible();
      await expect(element(by.id('register-email-input'))).toBeVisible();
      await expect(element(by.id('register-username-input'))).toBeVisible();
      await expect(element(by.id('register-password-input'))).toBeVisible();
      await expect(element(by.id('register-button'))).toBeVisible();
    });

    it('should display back button', async () => {
      await expect(element(by.id('back-button'))).toBeVisible();
    });

    it('should navigate back to login', async () => {
      await element(by.id('back-button')).tap();

      await waitFor(element(by.id('login-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should validate email format', async () => {
      await element(by.id('register-email-input')).typeText('invalid-email');
      await element(by.id('register-username-input')).typeText('testuser');
      await element(by.id('register-password-input')).typeText('Test123456');
      await element(by.id('register-button')).tap();

      // 等待验证错误显示
      await waitFor(element(by.text('请输入有效的邮箱地址')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should validate username length', async () => {
      await element(by.id('register-email-input')).typeText('test@example.com');
      await element(by.id('register-username-input')).typeText('ab'); // 太短
      await element(by.id('register-password-input')).typeText('Test123456');
      await element(by.id('register-button')).tap();

      // 等待验证错误显示
      await waitFor(element(by.text('用户名长度需要在3-150个字符之间')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should validate password requirements', async () => {
      await element(by.id('register-email-input')).typeText('new@example.com');
      await element(by.id('register-username-input')).typeText('newuser');
      await element(by.id('register-password-input')).typeText('12345'); // 太短

      await element(by.id('register-button')).tap();

      // 等待验证错误显示
      await waitFor(element(by.text('密码至少6个字符')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Logout', () => {
    beforeEach(async () => {
      // 先登录
      await element(by.id('login-email-input')).typeText(TEST_USER.email);
      await element(by.id('login-password-input')).typeText(TEST_USER.password);
      await element(by.id('login-button')).tap();

      // 等待登录成功并跳转到首页
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(15000);
    });

    it('should navigate to profile tab', async () => {
      // 导航到个人中心
      await element(by.label('tab-profile')).tap();

      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should navigate to settings screen', async () => {
      // 导航到个人中心
      await element(by.label('tab-profile')).tap();
      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // 点击设置
      await element(by.id('settings-button')).tap();

      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should logout and return to login screen', async () => {
      // 导航到个人中心
      await element(by.label('tab-profile')).tap();
      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // 点击设置
      await element(by.id('settings-button')).tap();
      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // 点击退出登录
      await element(by.id('logout-button')).tap();

      // 确认退出 (Alert 弹窗)
      await waitFor(element(by.text('确定')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.text('确定')).tap();

      // 验证返回登录页
      await waitFor(element(by.id('login-screen')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should cancel logout when pressing cancel', async () => {
      // 导航到个人中心
      await element(by.label('tab-profile')).tap();
      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // 点击设置
      await element(by.id('settings-button')).tap();
      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // 点击退出登录
      await element(by.id('logout-button')).tap();

      // 点击取消
      await waitFor(element(by.text('取消')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.text('取消')).tap();

      // 验证仍然在设置页
      await expect(element(by.id('settings-screen'))).toBeVisible();
    });
  });
});
