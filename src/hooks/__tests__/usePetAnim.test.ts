/**
 * usePetAnim Hook 测试
 */

import { renderHook } from '@testing-library/react-native';
import { usePetAnim } from '../usePetAnim';

jest.mock('lottie-react-native', () => ({
  default: 'Lottie',
}));

describe('usePetAnim', () => {
  describe('hook behavior', () => {
    it('should return animation controls', () => {
      const { result } = renderHook(() => usePetAnim());

      expect(result.current).toBeDefined();
      expect(typeof result.current).toBe('object');
    });

    it('should have lottieRef', () => {
      const { result } = renderHook(() => usePetAnim());

      expect(result.current).toHaveProperty('lottieRef');
    });

    it('should have playInteractAnim method', () => {
      const { result } = renderHook(() => usePetAnim());

      expect(result.current).toHaveProperty('playInteractAnim');
      expect(typeof result.current.playInteractAnim).toBe('function');
    });

    it('should not throw on render', () => {
      expect(() => {
        renderHook(() => usePetAnim());
      }).not.toThrow();
    });
  });
});
