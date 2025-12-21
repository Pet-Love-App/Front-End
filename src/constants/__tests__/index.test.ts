import * as Constants from '../index';
import { BADGE_CONFIGS } from '../badges';
import { Colors, PRIMARY_PALETTE, NEUTRAL_PALETTE, SEMANTIC_COLORS } from '../colors';
import { NUTRITION_NAME_MAP, CHART_COLORS, NUTRITION_COLOR_MAP } from '../nutrition';
import { CAT_BREEDS, DOG_BREEDS } from '../petBreeds';
import { CARD_STYLES } from '../platformStyles';
import { Fonts } from '../theme';

describe('constants index', () => {
  it('should export badges', () => {
    expect(Constants.BADGE_CONFIGS).toBe(BADGE_CONFIGS);
  });

  it('should export colors', () => {
    expect(Constants.Colors).toBe(Colors);
    expect(Constants.PRIMARY_PALETTE).toBe(PRIMARY_PALETTE);
    expect(Constants.NEUTRAL_PALETTE).toBe(NEUTRAL_PALETTE);
    expect(Constants.SEMANTIC_COLORS).toBe(SEMANTIC_COLORS);
  });

  it('should export nutrition', () => {
    expect(Constants.NUTRITION_NAME_MAP).toBe(NUTRITION_NAME_MAP);
    expect(Constants.CHART_COLORS).toBe(CHART_COLORS);
    expect(Constants.NUTRITION_COLOR_MAP).toBe(NUTRITION_COLOR_MAP);
  });

  it('should export petBreeds', () => {
    expect(Constants.CAT_BREEDS).toBe(CAT_BREEDS);
    expect(Constants.DOG_BREEDS).toBe(DOG_BREEDS);
  });

  it('should export platformStyles', () => {
    expect(Constants.CARD_STYLES).toBe(CARD_STYLES);
  });

  it('should export theme fonts', () => {
    expect(Constants.Fonts).toBe(Fonts);
  });
});
