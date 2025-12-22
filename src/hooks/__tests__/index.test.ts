import * as Hooks from '../index';

describe('Hooks Index Export', () => {
  it('should export all hooks', () => {
    expect(Hooks.useCatfoodRealtime).toBeDefined();
    expect(Hooks.useDeepLink).toBeDefined();
    expect(Hooks.useExpoCamera).toBeDefined();
    expect(Hooks.useFavorite).toBeDefined();
    expect(Hooks.useCustomFonts).toBeDefined();
    expect(Hooks.useItemDetail).toBeDefined();
    expect(Hooks.useLazyLoad).toBeDefined();
    expect(Hooks.usePetAnim).toBeDefined();
    expect(Hooks.usePetDrag).toBeDefined();
    expect(Hooks.usePetStore).toBeDefined();
    expect(Hooks.useResponsiveLayout).toBeDefined();
    expect(Hooks.useThemeAwareColorScheme).toBeDefined();
    expect(Hooks.useThemeColor).toBeDefined();
  });
});
