jest.mock('tamagui', () => {
  const React = require('react');
  const Component = ({ children }: { children: any }) => children;
  return {
    Text: Component,
    XStack: Component,
    YStack: Component,
    Button: Component,
    Input: Component,
    TextArea: Component,
    ScrollView: Component,
    View: Component,
    Stack: Component,
    Spinner: Component,
    styled: (Component: any) => Component,
    Dialog: {
      ...Component,
      Trigger: Component,
      Portal: Component,
      Overlay: Component,
      Content: Component,
      Title: Component,
      Description: Component,
      Close: Component,
    },
  };
});

jest.mock('expo-av', () => ({
  Video: jest.fn(({ children }) => children),
  ResizeMode: {
    CONTAIN: 'contain',
    COVER: 'cover',
    STRETCH: 'stretch',
  },
}));

jest.mock('@tamagui/lucide-icons', () => ({
  X: () => null,
}));

import * as Components from '../index';

describe('Components Index Export', () => {
  it('should export all base components', () => {
    expect(Components.AppHeader).toBeDefined();
    expect(Components.BreedSelector).toBeDefined();
    expect(Components.CatFoodCard).toBeDefined();
    expect(Components.DismissKeyboardView).toBeDefined();
    expect(Components.ExternalLink).toBeDefined();
    expect(Components.HapticTab).toBeDefined();
    expect(Components.LottieAnimation).toBeDefined();
    expect(Components.PageHeader).toBeDefined();
    expect(Components.SearchBox).toBeDefined();
    expect(Components.ThemedText).toBeDefined();
    expect(Components.ThemedView).toBeDefined();
  });

  it('should export UI components', () => {
    expect(Components.IconSymbol).toBeDefined();
    expect(Components.AvatarImage).toBeDefined();
    expect(Components.OptimizedImage).toBeDefined();
    expect(Components.ProductImage).toBeDefined();
    expect(Components.Tag).toBeDefined();
  });
});
