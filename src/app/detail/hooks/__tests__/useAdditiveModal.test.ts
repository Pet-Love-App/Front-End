import { renderHook, act } from '@testing-library/react-native';
import { useAdditiveModal } from '../useAdditiveModal';
import type { Additive } from '@/src/lib/supabase';

const mockAdditive: Additive = {
  id: 1,
  name: 'Additive 1',
  description: 'Description 1',
  safety_level: 'Safe',
  // Add other properties as needed by the type
} as any;

describe('useAdditiveModal', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAdditiveModal());

    expect(result.current.selectedAdditive).toBeNull();
    expect(result.current.modalVisible).toBeFalsy();
  });

  it('should open modal and set selected additive', () => {
    const { result } = renderHook(() => useAdditiveModal());

    act(() => {
      result.current.handleAdditivePress(mockAdditive);
    });

    expect(result.current.selectedAdditive).toEqual(mockAdditive);
    expect(result.current.modalVisible).toBeTruthy();
  });

  it('should close modal and clear selected additive', () => {
    const { result } = renderHook(() => useAdditiveModal());

    // First open it
    act(() => {
      result.current.handleAdditivePress(mockAdditive);
    });

    expect(result.current.modalVisible).toBeTruthy();

    // Then close it
    act(() => {
      result.current.handleCloseModal();
    });

    expect(result.current.modalVisible).toBeFalsy();
    expect(result.current.selectedAdditive).toBeNull();
  });
});
