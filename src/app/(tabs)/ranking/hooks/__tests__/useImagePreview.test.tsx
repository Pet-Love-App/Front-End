import { renderHook, act } from '@testing-library/react-native';
import { useImagePreview } from '../useImagePreview';

describe('useImagePreview', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useImagePreview());

    expect(result.current.previewVisible).toBe(false);
    expect(result.current.previewImageUrl).toBe('');
  });

  it('should handle image press', () => {
    const { result } = renderHook(() => useImagePreview());
    const imageUrl = 'https://example.com/image.jpg';

    act(() => {
      result.current.handleImagePress(imageUrl);
    });

    expect(result.current.previewVisible).toBe(true);
    expect(result.current.previewImageUrl).toBe(imageUrl);
  });

  it('should close preview', () => {
    const { result } = renderHook(() => useImagePreview());
    const imageUrl = 'https://example.com/image.jpg';

    act(() => {
      result.current.handleImagePress(imageUrl);
    });

    act(() => {
      result.current.closePreview();
    });

    expect(result.current.previewVisible).toBe(false);
    expect(result.current.previewImageUrl).toBe('');
  });
});
