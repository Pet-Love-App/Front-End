if (typeof navigator === 'undefined') {
  global.navigator = {
    userAgent: 'node.js',
  } as any;
}

// Tamagui web expects a DOM-like API
if (typeof (global as any).addEventListener === 'undefined') {
  (global as any).addEventListener = jest.fn();
}

// Tamagui select expects window.matchMedia
if (typeof (global as any).window === 'undefined') {
  (global as any).window = {} as any;
}
if (typeof (global as any).window.matchMedia === 'undefined') {
  (global as any).window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}
const screens = require('../index');

// Mock expo-av to avoid native module requirement when importing PostDetail deps
jest.mock('expo-av', () => ({
  Video: 'Video',
  ResizeMode: {},
}));

describe('collect screens index', () => {
  it('exports CollectScreen', () => {
    expect(typeof screens.CollectScreen).toBe('function');
  });
});
