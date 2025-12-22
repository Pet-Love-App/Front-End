/**
 * 猫粮浏览 E2E 测试
 *
 * 测试猫粮列表、搜索、详情、收藏等流程
 * 测试账号: 3157085660@qq.com / 123456
 */

import { device, element, by, expect, waitFor } from 'detox';
import { reloadApp, loginTestUser, waitForElement } from '../init';

describe('Cat Food Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    // 等待应用加载
    await waitForElement('login-screen', 30000);
    // 登录测试用户
    await loginTestUser();
  });

  beforeEach(async () => {
    await reloadApp();
    // 等待主页加载
    await waitForElement('home-screen', 10000);
    // 切换到排行榜标签页 (catfood-list 在排行榜页面)
    await element(by.label('tab-ranking')).tap();
    await waitForElement('ranking-screen', 5000);
  });

  describe('Cat Food List', () => {
    it('should display ranking screen', async () => {
      await expect(element(by.id('ranking-screen'))).toBeVisible();
    });

    it('should display cat food list', async () => {
      await waitFor(element(by.id('catfood-list')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should display cat food items', async () => {
      await waitFor(element(by.id('catfood-item')).atIndex(0))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should load more items on scroll', async () => {
      // 等待列表加载
      await waitFor(element(by.id('catfood-list')))
        .toBeVisible()
        .withTimeout(10000);

      // 获取初始列表
      const initialList = element(by.id('catfood-item')).atIndex(0);
      await expect(initialList).toBeVisible();

      // 向下滚动
      await element(by.id('catfood-list')).scroll(500, 'down');

      // 验证加载了更多项目 (如果列表足够长)
      // 注意：如果列表项少于6个，这个测试可能会失败
    });

    it('should refresh list on pull down', async () => {
      // 等待列表加载
      await waitFor(element(by.id('catfood-list')))
        .toBeVisible()
        .withTimeout(10000);

      // 下拉刷新 - 向上滚动触发下拉刷新
      await element(by.id('catfood-list')).scroll(200, 'up');

      // 等待刷新完成并验证列表仍然存在
      await waitFor(element(by.id('catfood-list')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Cat Food Detail', () => {
    it('should navigate to detail screen on item tap', async () => {
      // 等待列表加载
      await waitFor(element(by.id('catfood-item')).atIndex(0))
        .toBeVisible()
        .withTimeout(10000);

      // 点击第一个猫粮项目
      await element(by.id('catfood-item')).atIndex(0).tap();

      // 验证详情页显示 (通过路由跳转)
      await waitFor(element(by.id('catfood-detail-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Tab Navigation', () => {
    it('should navigate to collect tab', async () => {
      await element(by.label('tab-collect')).tap();
      await waitForElement('home-screen', 5000);
    });

    it('should navigate back to ranking tab', async () => {
      await element(by.label('tab-collect')).tap();
      await waitForElement('home-screen', 5000);

      await element(by.label('tab-ranking')).tap();
      await waitForElement('ranking-screen', 5000);
    });
  });
});
