import { CARD_STYLES } from '../platformStyles';

describe('platformStyles', () => {
  it('should export CARD_STYLES with correct structure', () => {
    expect(CARD_STYLES).toBeDefined();
    expect(CARD_STYLES.default).toBeDefined();
    expect(CARD_STYLES.elevated).toBeDefined();
    expect(CARD_STYLES.flat).toBeDefined();
  });

  it('should have correct default card styles', () => {
    expect(CARD_STYLES.default).toEqual({
      bordered: true,
      borderWidth: 1,
      borderRadius: '$4',
    });
  });

  it('should have correct elevated card styles', () => {
    expect(CARD_STYLES.elevated).toEqual({
      bordered: true,
      borderWidth: 2,
      borderRadius: '$5',
    });
  });

  it('should have correct flat card styles', () => {
    expect(CARD_STYLES.flat).toEqual({
      borderWidth: 0,
      borderRadius: '$4',
    });
  });
});
