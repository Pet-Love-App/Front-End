/**
 * 猫粮浏览 E2E 测试
 *
 * 测试猫粮列表、搜索、详情、收藏等流程
 */

import { device, element, by, expect } from 'detox';
import { reloadApp, loginTestUser } from '../init';

describe('Cat Food Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    // 登录测试用户
    await loginTestUser('test@petlove.com', 'Test123456');
  });

  beforeEach(async () => {
    await reloadApp();
  });

  describe('Cat Food List', () => {
    it('should display cat food list on home screen', async () => {
      await expect(element(by.id('catfood-list'))).toBeVisible();
    });

    it('should load more items on scroll', async () => {
      // 获取初始列表
      const initialList = element(by.id('catfood-item')).atIndex(0);
      await expect(initialList).toBeVisible();

      // 向下滚动
      await element(by.id('catfood-list')).scroll(500, 'down');

      // 验证加载了更多项目
      const moreItems = element(by.id('catfood-item')).atIndex(5);
      await expect(moreItems).toBeVisible();
    });

    it('should refresh list on pull down', async () => {
      // 下拉刷新
      await element(by.id('catfood-list')).scroll(200, 'down', NaN, NaN, 0.5);

      // 验证刷新指示器
      await expect(element(by.id('refresh-indicator'))).toBeVisible();

      // 等待刷新完成
      await waitFor(element(by.id('refresh-indicator')))
        .not.toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Search', () => {
    beforeEach(async () => {
      // 点击搜索框
      await element(by.id('search-box')).tap();
    });

    it('should display search results', async () => {
      // 输入搜索关键词
      await element(by.id('search-input')).typeText('皇家');
      await element(by.id('search-submit')).tap();

      // 验证搜索结果
      await waitFor(element(by.id('search-results')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show no results message for invalid search', async () => {
      await element(by.id('search-input')).typeText('xyznotfound123');
      await element(by.id('search-submit')).tap();

      await expect(element(by.text('未找到相关猫粮'))).toBeVisible();
    });
  });

  describe('Cat Food Detail', () => {
    it('should navigate to detail screen on item tap', async () => {
      // 点击第一个猫粮项目
      await element(by.id('catfood-item')).atIndex(0).tap();

      // 验证详情页显示
      await expect(element(by.id('catfood-detail-screen'))).toBeVisible();
      await expect(element(by.id('catfood-name'))).toBeVisible();
      await expect(element(by.id('catfood-price'))).toBeVisible();
    });

    it('should display nutrition information', async () => {
      await element(by.id('catfood-item')).atIndex(0).tap();

      // 滚动到营养成分部分
      await element(by.id('detail-scroll-view')).scroll(300, 'down');

      await expect(element(by.id('nutrition-section'))).toBeVisible();
    });
  });

  describe('Favorite', () => {
    it('should toggle favorite status', async () => {
      // 进入详情页
      await element(by.id('catfood-item')).atIndex(0).tap();

      // 点击收藏按钮
      await element(by.id('favorite-button')).tap();

      // 验证收藏成功提示
      await expect(element(by.text('已收藏此报告'))).toBeVisible();

      // 再次点击取消收藏
      await element(by.id('favorite-button')).tap();

      // 验证取消收藏提示
      await expect(element(by.text('已取消收藏'))).toBeVisible();
    });
  });
});
