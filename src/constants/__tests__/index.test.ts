import * as Constants from '../index';
import { BADGE_CONFIGS } from '../badges';
import { Colors } from '../colors';
import { NUTRITION_NAME_MAP } from '../nutrition';
import { CAT_BREEDS } from '../petBreeds';
import { CARD_STYLES } from '../platformStyles';
import { Fonts } from '../theme';

describe('constants index', () => {
  it('should export badges', () => {
    expect(Constants.BADGE_CONFIGS).toBe(BADGE_CONFIGS);
  });

  it('should export colors', () => {
    expect(Constants.Colors).toBe(Colors);
  });

  it('should export nutrition', () => {
    expect(Constants.NUTRITION_NAME_MAP).toBe(NUTRITION_NAME_MAP);
  });

  it('should export petBreeds', () => {
    expect(Constants.CAT_BREEDS).toBe(CAT_BREEDS);
  });

  it('should export platformStyles', () => {
    expect(Constants.CARD_STYLES).toBe(CARD_STYLES);
  });

  it('should export theme fonts', () => {
    expect(Constants.Fonts).toBe(Fonts);
  });
});
