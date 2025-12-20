/**
 * Detox E2E 测试 - 启动测试
 *
 * 这是一个基础测试，验证应用能够正常启动
 */

describe('Pet Love App', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES', camera: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show login screen on launch', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('should have email input field', async () => {
    await expect(element(by.id('login-email-input'))).toBeVisible();
  });

  it('should have password input field', async () => {
    await expect(element(by.id('login-password-input'))).toBeVisible();
  });

  it('should have login button', async () => {
    await expect(element(by.id('login-button'))).toBeVisible();
  });
});
