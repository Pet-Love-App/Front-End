import * as hooks from '../index';

jest.mock('@/src/components/dialogs', () => ({
  showAlert: jest.fn(),
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('tamagui', () => ({
  YStack: 'YStack',
  XStack: 'XStack',
  Text: 'Text',
  Dialog: {
    Portal: 'DialogPortal',
    Overlay: 'DialogOverlay',
    Content: 'DialogContent',
    Title: 'DialogTitle',
    Description: 'DialogDescription',
    Close: 'DialogClose',
  },
}));

describe('collect hooks index', () => {
  it('exports expected hooks', () => {
    expect(typeof hooks.useCollectData).toBe('function');
    expect(typeof hooks.useCollectFilter).toBe('function');
    expect(typeof hooks.usePostCollectData).toBe('function');
    expect(typeof hooks.useReportCollectData).toBe('function');
  });
});
