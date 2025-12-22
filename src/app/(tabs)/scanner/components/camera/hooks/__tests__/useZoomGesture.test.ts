import { renderHook } from '@testing-library/react-native';
import { useZoomGesture } from '../useZoomGesture';
import { PanResponder } from 'react-native';
import * as Haptics from 'expo-haptics';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
  },
}));

describe('useZoomGesture', () => {
  let mockSetZoom: jest.Mock;
  let panResponderHandlers: any;

  beforeEach(() => {
    mockSetZoom = jest.fn();
    jest.clearAllMocks();

    // Spy on PanResponder.create to capture the handlers
    jest.spyOn(PanResponder, 'create').mockImplementation((config) => {
      panResponderHandlers = config;
      return { panHandlers: {} } as any;
    });
  });

  it('should initialize correctly', () => {
    const { result } = renderHook(() =>
      useZoomGesture({ zoom: 0.5, setZoom: mockSetZoom })
    );

    expect(result.current.panResponder).toBeDefined();
    expect(PanResponder.create).toHaveBeenCalled();
  });

  it('should only respond to 2 touches', () => {
    renderHook(() => useZoomGesture({ zoom: 0.5, setZoom: mockSetZoom }));

    const evt1Touch = { nativeEvent: { touches: [{}] } };
    const evt2Touches = { nativeEvent: { touches: [{}, {}] } };

    expect(panResponderHandlers.onStartShouldSetPanResponder(evt1Touch)).toBe(false);
    expect(panResponderHandlers.onStartShouldSetPanResponder(evt2Touches)).toBe(true);

    expect(panResponderHandlers.onMoveShouldSetPanResponder(evt1Touch)).toBe(false);
    expect(panResponderHandlers.onMoveShouldSetPanResponder(evt2Touches)).toBe(true);
  });

  it('should handle pinch zoom correctly', () => {
    renderHook(() => useZoomGesture({ zoom: 0.5, setZoom: mockSetZoom }));

    // Grant
    const startEvt = {
      nativeEvent: {
        touches: [
          { pageX: 0, pageY: 0 },
          { pageX: 100, pageY: 0 }, // Distance = 100
        ],
      },
    };
    panResponderHandlers.onPanResponderGrant(startEvt);

    // Move - Pinch out (Zoom in)
    const moveEvt = {
      nativeEvent: {
        touches: [
          { pageX: 0, pageY: 0 },
          { pageX: 120, pageY: 0 }, // Distance = 120, Diff = 20
        ],
      },
    };
    panResponderHandlers.onPanResponderMove(moveEvt);

    // Diff = 20. ZoomChange = 20 / 400 = 0.05. New Zoom = 0.5 + 0.05 = 0.55
    expect(mockSetZoom).toHaveBeenCalledWith(0.55);
    expect(Haptics.impactAsync).toHaveBeenCalled(); // 0.05 > 0.03
  });

  it('should handle vertical slide zoom correctly', () => {
    renderHook(() => useZoomGesture({ zoom: 0.5, setZoom: mockSetZoom }));

    // Grant
    const startEvt = {
      nativeEvent: {
        touches: [
          { pageX: 0, pageY: 100 },
          { pageX: 50, pageY: 100 }, // Avg Y = 100
        ],
      },
    };
    panResponderHandlers.onPanResponderGrant(startEvt);

    // Move - Slide up (Zoom in? Logic: yDiff = lastY - currentY. If slide up, currentY < lastY, so yDiff > 0 -> Zoom in)
    const moveEvt = {
      nativeEvent: {
        touches: [
          { pageX: 0, pageY: 80 },
          { pageX: 50, pageY: 80 }, // Avg Y = 80. Diff = 100 - 80 = 20
        ],
      },
    };
    panResponderHandlers.onPanResponderMove(moveEvt);

    // Diff = 20. ZoomChange = 20 / 250 = 0.08. New Zoom = 0.5 + 0.08 = 0.58
    expect(mockSetZoom).toHaveBeenCalledWith(0.58);
  });

  it('should respect zoom limits', () => {
    // Test max limit
    renderHook(() => useZoomGesture({ zoom: 0.99, setZoom: mockSetZoom }));

    const startEvt = {
      nativeEvent: {
        touches: [
          { pageX: 0, pageY: 0 },
          { pageX: 100, pageY: 0 },
        ],
      },
    };
    panResponderHandlers.onPanResponderGrant(startEvt);

    const moveEvt = {
      nativeEvent: {
        touches: [
          { pageX: 0, pageY: 0 },
          { pageX: 200, pageY: 0 }, // Diff = 100. Change = 0.25. 0.99 + 0.25 > 1
        ],
      },
    };
    panResponderHandlers.onPanResponderMove(moveEvt);

    expect(mockSetZoom).toHaveBeenCalledWith(1);
  });

  it('should not zoom if change is too small', () => {
    renderHook(() => useZoomGesture({ zoom: 0.5, setZoom: mockSetZoom }));

    const startEvt = {
      nativeEvent: {
        touches: [
          { pageX: 0, pageY: 0 },
          { pageX: 100, pageY: 0 },
        ],
      },
    };
    panResponderHandlers.onPanResponderGrant(startEvt);

    const moveEvt = {
      nativeEvent: {
        touches: [
          { pageX: 0, pageY: 0 },
          { pageX: 101, pageY: 0 }, // Diff = 1. Change = 1/400 = 0.0025 < 0.005
        ],
      },
    };
    panResponderHandlers.onPanResponderMove(moveEvt);

    expect(mockSetZoom).not.toHaveBeenCalled();
  });

  it('should reset isZooming on release', () => {
    renderHook(() => useZoomGesture({ zoom: 0.5, setZoom: mockSetZoom }));

    const startEvt = {
      nativeEvent: {
        touches: [
          { pageX: 0, pageY: 0 },
          { pageX: 100, pageY: 0 },
        ],
      },
    };
    panResponderHandlers.onPanResponderGrant(startEvt);

    panResponderHandlers.onPanResponderRelease();

    const moveEvt = {
      nativeEvent: {
        touches: [
          { pageX: 0, pageY: 0 },
          { pageX: 200, pageY: 0 },
        ],
      },
    };
    panResponderHandlers.onPanResponderMove(moveEvt);

    expect(mockSetZoom).not.toHaveBeenCalled();
  });
});
