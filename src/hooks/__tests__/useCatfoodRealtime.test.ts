import { renderHook } from '@testing-library/react-native';
import { useCatfoodRealtime } from '../useCatfoodRealtime';
import { supabase } from '@/src/lib/supabase/client';
import { useCatFoodStore } from '@/src/store/catFoodStore';
import { logger } from '@/src/utils/logger';

// Mock dependencies
jest.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    channel: jest.fn(),
    removeChannel: jest.fn(),
  },
}));

jest.mock('@/src/store/catFoodStore', () => ({
  useCatFoodStore: jest.fn(),
}));

jest.mock('@/src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useCatfoodRealtime', () => {
  const mockUpdateCatFood = jest.fn();
  const mockChannel = {
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useCatFoodStore as unknown as jest.Mock).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({ updateCatFood: mockUpdateCatFood });
      }
      return { updateCatFood: mockUpdateCatFood };
    });
    (supabase.channel as jest.Mock).mockReturnValue(mockChannel);
  });

  it('should not subscribe if enabled is false', () => {
    // Arrange
    const options = { enabled: false };

    // Act
    renderHook(() => useCatfoodRealtime(options));

    // Assert
    expect(logger.debug).toHaveBeenCalledWith('Realtime 订阅未启用');
    expect(supabase.channel).not.toHaveBeenCalled();
  });

  it('should subscribe to all catfoods if catfoodId is not provided', () => {
    // Arrange
    const options = { enabled: true };

    // Act
    renderHook(() => useCatfoodRealtime(options));

    // Assert
    expect(supabase.channel).toHaveBeenCalledWith('catfood-realtime-all');
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'catfoods',
        filter: undefined,
      },
      expect.any(Function)
    );
  });

  it('should subscribe to specific catfood if catfoodId is provided', () => {
    // Arrange
    const catfoodId = 123;
    const options = { enabled: true, catfoodId };

    // Act
    renderHook(() => useCatfoodRealtime(options));

    // Assert
    expect(supabase.channel).toHaveBeenCalledWith(`catfood-realtime-${catfoodId}`);
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'catfoods',
        filter: `id=eq.${catfoodId}`,
      },
      expect.any(Function)
    );
  });

  it('should handle UPDATE event correctly', () => {
    // Arrange
    const onUpdate = jest.fn();
    const options = { enabled: true, onUpdate };
    const payload = {
      new: {
        id: 1,
        score: 4.5,
        count_num: 100,
      },
    };

    let updateCallback: any;
    (mockChannel.on as jest.Mock).mockImplementation((event, filter, cb) => {
      updateCallback = cb;
      return mockChannel;
    });

    // Act
    renderHook(() => useCatfoodRealtime(options));

    // Simulate UPDATE event
    updateCallback(payload);

    // Assert
    expect(logger.info).toHaveBeenCalledWith('📊 Catfood 更新', payload);
    expect(mockUpdateCatFood).toHaveBeenCalledWith(1, {
      score: 4.5,
      countNum: 100,
    });
    expect(onUpdate).toHaveBeenCalledWith(payload.new);
  });

  // Note: The current implementation of useCatfoodRealtime doesn't seem to return a cleanup function that unsubscribes.
  // If it does (or should), we would test it here.
  // Looking at the source code provided:
  // It creates a channel but doesn't seem to call .subscribe() explicitly (maybe it's implied or missing in the snippet I read?)
  // Also, useEffect usually returns a cleanup function.
  // Let's check the source code again.
  // The source code provided in context shows:
  // const channel = supabase.channel(channelName);
  // channel.on(...)
  // It does NOT show .subscribe() being called.
  // It does NOT show a return function in useEffect for cleanup.
  // This might be a bug in the source code or I missed it.
  // However, I will write the test based on what I see.
});
