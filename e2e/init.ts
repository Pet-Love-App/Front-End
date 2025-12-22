/**
 * Detox E2E 测试初始化
 * 提供测试前的设置和工具函数
 *
 * 测试账号: 3157085660@qq.com / 123456
 */

import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

// 默认测试账户
export const TEST_USER = {
  email: '3157085660@qq.com',
  password: '123456',
};

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
  await waitFor(element(by.id(testId)))
    .toBeVisible()
    .withTimeout(timeout);
}

/**
 * 等待元素消失
 */
export async function waitForElementToDisappear(testId: string, timeout = 5000) {
  await waitFor(element(by.id(testId)))
    .not.toBeVisible()
    .withTimeout(timeout);
}

/**
 * 登录测试用户
 */
export async function loginTestUser(
  email: string = TEST_USER.email,
  password: string = TEST_USER.password
) {
  // 等待登录页面出现
  await waitForElement('login-screen', 15000);
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
  await element(by.label('tab-profile')).tap();
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

/**
 * 等待文本可见
 */
export async function waitForText(text: string, timeout = 5000) {
  await waitFor(element(by.text(text)))
    .toBeVisible()
    .withTimeout(timeout);
}

/**
 * 导航到指定标签页
 */
export async function navigateToTab(
  tabName: 'collect' | 'forum' | 'scanner' | 'ranking' | 'profile'
) {
  await element(by.label(`tab-${tabName}`)).tap();

  const screenIds: Record<string, string> = {
    collect: 'home-screen',
    forum: 'forum-screen',
    scanner: 'scanner-screen',
    ranking: 'ranking-screen',
    profile: 'profile-screen',
  };

  if (screenIds[tabName] && tabName !== 'scanner') {
    await waitForElement(screenIds[tabName], 5000);
  }
}

/**
 * 检查元素是否存在（不抛出错误）
 */
export async function elementExists(testId: string): Promise<boolean> {
  try {
    await waitFor(element(by.id(testId)))
      .toBeVisible()
      .withTimeout(2000);
    return true;
  } catch {
    return false;
  }
}

/**
 * 安全点击元素（如果存在）
 */
export async function safeClick(testId: string): Promise<boolean> {
  try {
    const exists = await elementExists(testId);
    if (exists) {
      await element(by.id(testId)).tap();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
