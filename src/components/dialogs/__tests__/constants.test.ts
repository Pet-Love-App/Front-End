import {
  DIALOG_COLORS,
  DIALOG_GRADIENTS,
  DIALOG_SIZES,
  BORDER_RADIUS,
  SPACING,
  FONT_SIZE,
  SHADOWS,
  ANIMATION_CONFIG,
  DIALOG_ICONS,
  SF_SYMBOLS,
  TYPE_COLORS,
  TOAST_POSITIONS,
  TOAST_DURATION,
} from '../constants';

describe('Dialog Constants', () => {
  it('should have correct color definitions', () => {
    expect(DIALOG_COLORS).toBeDefined();
    expect(DIALOG_COLORS.primary).toBe('#FEBE98');
    expect(DIALOG_COLORS.success).toBe('#10B981');
    expect(DIALOG_COLORS.error).toBe('#EF4444');
    expect(DIALOG_COLORS.warning).toBe('#F59E0B');
    expect(DIALOG_COLORS.info).toBe('#3B82F6');
  });

  it('should have correct gradient definitions', () => {
    expect(DIALOG_GRADIENTS).toBeDefined();
    expect(DIALOG_GRADIENTS.primary).toHaveLength(2);
    expect(DIALOG_GRADIENTS.success).toHaveLength(2);
  });

  it('should have correct size definitions', () => {
    expect(DIALOG_SIZES).toBeDefined();
    expect(DIALOG_SIZES.small.width).toBe(320);
    expect(DIALOG_SIZES.fullscreen.width).toBe('100%');
  });

  it('should have correct border radius definitions', () => {
    expect(BORDER_RADIUS).toBeDefined();
    expect(BORDER_RADIUS.small).toBe(8);
    expect(BORDER_RADIUS.full).toBe(9999);
  });

  it('should have correct spacing definitions', () => {
    expect(SPACING).toBeDefined();
    expect(SPACING.md).toBe(16);
  });

  it('should have correct font size definitions', () => {
    expect(FONT_SIZE).toBeDefined();
    expect(FONT_SIZE.base).toBe(16);
  });

  it('should have correct shadow definitions', () => {
    expect(SHADOWS).toBeDefined();
    expect(SHADOWS.sm).toHaveProperty('shadowColor');
    expect(SHADOWS.sm).toHaveProperty('elevation');
  });

  it('should have correct animation config', () => {
    expect(ANIMATION_CONFIG).toBeDefined();
    expect(ANIMATION_CONFIG.quick.type).toBe('spring');
  });

  it('should have correct icon mappings', () => {
    expect(DIALOG_ICONS).toBeDefined();
    expect(DIALOG_ICONS.success).toBe('✅');
    expect(SF_SYMBOLS.success).toBe('checkmark.circle.fill');
  });

  it('should have correct type colors mapping', () => {
    expect(TYPE_COLORS).toBeDefined();
    expect(TYPE_COLORS.success.bg).toBe(DIALOG_COLORS.successLight);
    expect(TYPE_COLORS.error.text).toBe(DIALOG_COLORS.errorDark);
  });

  it('should have correct toast positions', () => {
    expect(TOAST_POSITIONS).toBeDefined();
    expect(TOAST_POSITIONS['top-right']).toHaveProperty('top');
    expect(TOAST_POSITIONS['top-right']).toHaveProperty('right');
  });

  it('should have correct toast durations', () => {
    expect(TOAST_DURATION).toBeDefined();
    expect(TOAST_DURATION.short).toBe(2000);
    expect(TOAST_DURATION.long).toBe(5000);
  });
});
