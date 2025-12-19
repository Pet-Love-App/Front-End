/**
 * E2E 测试初始化
 *
 * 提供测试前的设置和工具函数
 */

import { device, element, by, expect } from 'detox';

/**
 * 测试前重启应用
 */
export async function reloadApp() {
  await device.reloadReactNative();
}

/**
 * 登录测试用户
 */
export async function loginTestUser(email: string, password: string) {
  // 等待登录页面加载
  await waitFor(element(by.id('login-email-input')))
    .toBeVisible()
    .withTimeout(5000);

  // 输入凭据
  await element(by.id('login-email-input')).typeText(email);
  await element(by.id('login-password-input')).typeText(password);

  // 点击登录按钮
  await element(by.id('login-button')).tap();

  // 等待登录完成
  await waitFor(element(by.id('home-screen')))
    .toBeVisible()
    .withTimeout(10000);
}

/**
 * 登出
 */
export async function logoutUser() {
  // 导航到个人中心
  await element(by.id('tab-profile')).tap();

  // 点击设置
  await element(by.id('settings-button')).tap();

  // 点击退出登录
  await element(by.id('logout-button')).tap();

  // 确认退出
  await element(by.text('确定')).tap();

  // 等待返回登录页
  await waitFor(element(by.id('login-screen')))
    .toBeVisible()
    .withTimeout(5000);
}

/**
 * 等待元素可见
 */
export async function waitForElement(testId: string, timeout = 5000) {
  await waitFor(element(by.id(testId)))
    .toBeVisible()
    .withTimeout(timeout);
}

/**
 * 滚动到元素
 */
export async function scrollToElement(
  scrollViewId: string,
  elementId: string,
  direction: 'up' | 'down' = 'down'
) {
  await waitFor(element(by.id(elementId)))
    .toBeVisible()
    .whileElement(by.id(scrollViewId))
    .scroll(200, direction);
}
