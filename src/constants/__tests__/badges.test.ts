/**
 * Badges Constants 单元测试
 *
 * 测试勋章配置和辅助函数
 * 遵循 AAA (Arrange-Act-Assert) 模式
 */

import {
  BADGE_CONFIGS,
  RARITY_CONFIGS,
  CATEGORY_CONFIGS,
  getBadgeByLevel,
  getBadgesByCategory,
  getBadgesByRarity,
} from '../badges';

import type { BadgeCategory, BadgeConfig } from '../badges';

describe('Badge Constants', () => {
  // ==================== BADGE_CONFIGS ====================
  describe('BADGE_CONFIGS', () => {
    it('should have reputation level badges', () => {
      expect(BADGE_CONFIGS.novice).toBeDefined();
      expect(BADGE_CONFIGS.intermediate).toBeDefined();
      expect(BADGE_CONFIGS.advanced).toBeDefined();
      expect(BADGE_CONFIGS.expert).toBeDefined();
    });

    it('should have activity badges', () => {
      expect(BADGE_CONFIGS.first_comment).toBeDefined();
      expect(BADGE_CONFIGS.active_commenter).toBeDefined();
      expect(BADGE_CONFIGS.super_commenter).toBeDefined();
    });

    it('should have contribution badges', () => {
      expect(BADGE_CONFIGS.helpful_review).toBeDefined();
      expect(BADGE_CONFIGS.quality_reviewer).toBeDefined();
      expect(BADGE_CONFIGS.profile_master).toBeDefined();
    });

    it('should have special badges', () => {
      expect(BADGE_CONFIGS.early_adopter).toBeDefined();
      expect(BADGE_CONFIGS.beta_tester).toBeDefined();
      expect(BADGE_CONFIGS.community_star).toBeDefined();
    });

    it('should have correct structure for each badge', () => {
      // Arrange
      const requiredFields: (keyof BadgeConfig)[] = [
        'code',
        'name',
        'description',
        'icon',
        'color',
        'category',
        'rarity',
      ];

      // Act & Assert
      Object.values(BADGE_CONFIGS).forEach((badge) => {
        requiredFields.forEach((field) => {
          expect(badge[field]).toBeDefined();
        });
      });
    });

    describe('novice badge', () => {
      it('should have correct configuration', () => {
        const badge = BADGE_CONFIGS.novice;

        expect(badge.code).toBe('novice');
        expect(badge.name).toBe('新手猫奴');
        expect(badge.category).toBe('reputation');
        expect(badge.rarity).toBe('common');
        expect(badge.color).toBe('#94A3B8');
      });
    });

    describe('expert badge', () => {
      it('should have correct configuration', () => {
        const badge = BADGE_CONFIGS.expert;

        expect(badge.code).toBe('expert');
        expect(badge.name).toBe('猫粮专家');
        expect(badge.category).toBe('reputation');
        expect(badge.rarity).toBe('legendary');
        expect(badge.color).toBe('#F59E0B');
      });
    });
  });

  // ==================== RARITY_CONFIGS ====================
  describe('RARITY_CONFIGS', () => {
    it('should have all rarity levels', () => {
      expect(RARITY_CONFIGS.common).toBeDefined();
      expect(RARITY_CONFIGS.rare).toBeDefined();
      expect(RARITY_CONFIGS.epic).toBeDefined();
      expect(RARITY_CONFIGS.legendary).toBeDefined();
    });

    it('should have name, color, and glow for each rarity', () => {
      Object.values(RARITY_CONFIGS).forEach((config) => {
        expect(config.name).toBeDefined();
        expect(config.color).toBeDefined();
        expect(config.glow).toBeDefined();
      });
    });

    it('should have correct Chinese names', () => {
      expect(RARITY_CONFIGS.common.name).toBe('普通');
      expect(RARITY_CONFIGS.rare.name).toBe('稀有');
      expect(RARITY_CONFIGS.epic.name).toBe('史诗');
      expect(RARITY_CONFIGS.legendary.name).toBe('传说');
    });
  });

  // ==================== CATEGORY_CONFIGS ====================
  describe('CATEGORY_CONFIGS', () => {
    it('should have all categories', () => {
      expect(CATEGORY_CONFIGS.reputation).toBeDefined();
      expect(CATEGORY_CONFIGS.activity).toBeDefined();
      expect(CATEGORY_CONFIGS.contribution).toBeDefined();
      expect(CATEGORY_CONFIGS.special).toBeDefined();
    });

    it('should have name, icon, and color for each category', () => {
      Object.values(CATEGORY_CONFIGS).forEach((config) => {
        expect(config.name).toBeDefined();
        expect(config.icon).toBeDefined();
        expect(config.color).toBeDefined();
      });
    });

    it('should have correct Chinese names', () => {
      expect(CATEGORY_CONFIGS.reputation.name).toBe('信誉等级');
      expect(CATEGORY_CONFIGS.activity.name).toBe('活跃度');
      expect(CATEGORY_CONFIGS.contribution.name).toBe('贡献');
      expect(CATEGORY_CONFIGS.special.name).toBe('特殊');
    });
  });

  // ==================== getBadgeByLevel ====================
  describe('getBadgeByLevel', () => {
    it('should return correct badge for novice level', () => {
      // Arrange & Act
      const badge = getBadgeByLevel('novice');

      // Assert
      expect(badge).toBeDefined();
      expect(badge?.code).toBe('novice');
      expect(badge?.name).toBe('新手猫奴');
    });

    it('should return correct badge for intermediate level', () => {
      const badge = getBadgeByLevel('intermediate');

      expect(badge).toBeDefined();
      expect(badge?.code).toBe('intermediate');
      expect(badge?.name).toBe('进阶猫友');
    });

    it('should return correct badge for advanced level', () => {
      const badge = getBadgeByLevel('advanced');

      expect(badge).toBeDefined();
      expect(badge?.code).toBe('advanced');
      expect(badge?.name).toBe('资深铲屎官');
    });

    it('should return correct badge for expert level', () => {
      const badge = getBadgeByLevel('expert');

      expect(badge).toBeDefined();
      expect(badge?.code).toBe('expert');
      expect(badge?.name).toBe('猫粮专家');
    });

    it('should return undefined for invalid level', () => {
      const badge = getBadgeByLevel('invalid_level');

      expect(badge).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const badge = getBadgeByLevel('');

      expect(badge).toBeUndefined();
    });
  });

  // ==================== getBadgesByCategory ====================
  describe('getBadgesByCategory', () => {
    it('should return all reputation badges', () => {
      // Arrange & Act
      const badges = getBadgesByCategory('reputation');

      // Assert
      expect(badges.length).toBe(4);
      badges.forEach((badge) => {
        expect(badge.category).toBe('reputation');
      });
    });

    it('should return all activity badges', () => {
      const badges = getBadgesByCategory('activity');

      expect(badges.length).toBe(3);
      badges.forEach((badge) => {
        expect(badge.category).toBe('activity');
      });
    });

    it('should return all contribution badges', () => {
      const badges = getBadgesByCategory('contribution');

      expect(badges.length).toBe(3);
      badges.forEach((badge) => {
        expect(badge.category).toBe('contribution');
      });
    });

    it('should return all special badges', () => {
      const badges = getBadgesByCategory('special');

      expect(badges.length).toBe(3);
      badges.forEach((badge) => {
        expect(badge.category).toBe('special');
      });
    });

    it('should include specific badges in reputation category', () => {
      const badges = getBadgesByCategory('reputation');
      const codes = badges.map((b) => b.code);

      expect(codes).toContain('novice');
      expect(codes).toContain('intermediate');
      expect(codes).toContain('advanced');
      expect(codes).toContain('expert');
    });
  });

  // ==================== getBadgesByRarity ====================
  describe('getBadgesByRarity', () => {
    it('should return all common badges', () => {
      // Arrange & Act
      const badges = getBadgesByRarity('common');

      // Assert
      expect(badges.length).toBeGreaterThan(0);
      badges.forEach((badge) => {
        expect(badge.rarity).toBe('common');
      });
    });

    it('should return all rare badges', () => {
      const badges = getBadgesByRarity('rare');

      expect(badges.length).toBeGreaterThan(0);
      badges.forEach((badge) => {
        expect(badge.rarity).toBe('rare');
      });
    });

    it('should return all epic badges', () => {
      const badges = getBadgesByRarity('epic');

      expect(badges.length).toBeGreaterThan(0);
      badges.forEach((badge) => {
        expect(badge.rarity).toBe('epic');
      });
    });

    it('should return all legendary badges', () => {
      const badges = getBadgesByRarity('legendary');

      expect(badges.length).toBeGreaterThan(0);
      badges.forEach((badge) => {
        expect(badge.rarity).toBe('legendary');
      });
    });

    it('should include novice as common badge', () => {
      const badges = getBadgesByRarity('common');
      const codes = badges.map((b) => b.code);

      expect(codes).toContain('novice');
    });

    it('should include expert as legendary badge', () => {
      const badges = getBadgesByRarity('legendary');
      const codes = badges.map((b) => b.code);

      expect(codes).toContain('expert');
    });
  });

  // ==================== Integration Tests ====================
  describe('Integration', () => {
    it('should have consistent badge codes between BADGE_CONFIGS and getBadgeByLevel', () => {
      // Arrange
      const reputationLevels = ['novice', 'intermediate', 'advanced', 'expert'];

      // Act & Assert
      reputationLevels.forEach((level) => {
        const fromConfig = BADGE_CONFIGS[level];
        const fromFunction = getBadgeByLevel(level);

        expect(fromConfig).toEqual(fromFunction);
      });
    });

    it('should ensure all badges have valid category in CATEGORY_CONFIGS', () => {
      Object.values(BADGE_CONFIGS).forEach((badge) => {
        expect(CATEGORY_CONFIGS[badge.category]).toBeDefined();
      });
    });

    it('should ensure all badges have valid rarity in RARITY_CONFIGS', () => {
      Object.values(BADGE_CONFIGS).forEach((badge) => {
        expect(RARITY_CONFIGS[badge.rarity]).toBeDefined();
      });
    });
  });
});
