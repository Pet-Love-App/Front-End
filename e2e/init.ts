/**
 * Detox E2E 测试初始化
 * 提供测试前的设置和工具函数
 */

import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

/**
 * 重启应用
 */
export async function reloadApp() {
  await device.reloadReactNative();
}

/**
 * 等待元素可见
 */
export async function waitForElement(testId: string, timeout = 5000) {
  await detoxExpect(element(by.id(testId))).toBeVisible();
}

/**
 * 登录测试用户
 */
export async function loginTestUser(email: string, password: string) {
  await waitForElement('login-email-input', 10000);

  await element(by.id('login-email-input')).typeText(email);
  await element(by.id('login-password-input')).typeText(password);
  await element(by.id('login-button')).tap();

  // 等待登录完成，跳转到主页
  await waitForElement('home-screen', 15000);
}

/**
 * 登出
 */
export async function logoutUser() {
  await element(by.id('tab-profile')).tap();
  await element(by.id('settings-button')).tap();
  await element(by.id('logout-button')).tap();

  // 确认登出
  await element(by.text('确定')).tap();

  await waitForElement('login-screen', 5000);
}

/**
 * 滚动到元素
 */
export async function scrollToElement(
  scrollViewId: string,
  elementId: string,
  direction: 'up' | 'down' = 'down',
  amount = 200
) {
  await waitFor(element(by.id(elementId)))
    .toBeVisible()
    .whileElement(by.id(scrollViewId))
    .scroll(amount, direction);
}

/**
 * 清除输入框
 */
export async function clearInput(testId: string) {
  await element(by.id(testId)).clearText();
}

/**
 * 等待加载完成
 */
export async function waitForLoading(loadingId: string = 'loading-indicator', timeout = 10000) {
  await waitFor(element(by.id(loadingId)))
    .not.toBeVisible()
    .withTimeout(timeout);
}
