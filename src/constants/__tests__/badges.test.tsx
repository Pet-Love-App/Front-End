// src/constants/__tests__/badges.test.ts
import { BADGE_CONFIGS, getBadgeByLevel, getBadgesByCategory } from '../badges';

describe('Badge Configuration', () => {
  test('should have all reputation badges', () => {
    const reputationBadges = getBadgesByCategory('reputation');
    expect(reputationBadges.length).toBe(4); // novice, intermediate, advanced, expert
  });

  test('should have activity badges', () => {
    const activityBadges = getBadgesByCategory('activity');
    expect(activityBadges.length).toBe(2); // reliable_reviewer, consistent_ratings
  });

  test('getBadgeByLevel should return correct badge', () => {
    expect(getBadgeByLevel('novice')?.name).toBe('新手猫奴');
    expect(getBadgeByLevel('expert')?.name).toBe('猫粮专家');
    expect(getBadgeByLevel('reliable_reviewer')?.name).toBe('可信评价者');
  });

  test('reputation badges should have correct requirements', () => {
    expect(BADGE_CONFIGS.reliable_reviewer.requirement).toBe(
      '评价可信度维度达到35分以上并保持30天'
    );
    expect(BADGE_CONFIGS.consistent_ratings.requirement).toBe(
      '连续20条评分与商品平均分偏差不超过1分'
    );
  });
});
