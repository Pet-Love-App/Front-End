import { render, fireEvent, act } from '@testing-library/react-native';
import { DesktopPet } from '../DesktopPet';
import { usePetStore } from '@/src/hooks/usePetStore';
import { usePetAnim } from '@/src/hooks/usePetAnim';
import { usePetDrag } from '@/src/hooks/usePetDrag';
import React from 'react';
import { View, Text } from 'react-native';

// Mock dependencies
jest.mock('@/src/hooks/usePetStore', () => ({
  usePetStore: jest.fn(),
}));

jest.mock('@/src/hooks/usePetAnim', () => ({
  usePetAnim: jest.fn(),
}));

jest.mock('@/src/hooks/usePetDrag', () => ({
  usePetDrag: jest.fn(),
}));

jest.mock('lottie-react-native', () => 'LottieView');
jest.mock('expo-blur', () => ({ BlurView: 'BlurView' }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));

describe('DesktopPet', () => {
  const mockSetTalking = jest.fn();
  const mockNextFact = jest.fn();
  const mockSetVisible = jest.fn();
  const mockPanResponder = {
    panHandlers: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePetStore as unknown as jest.Mock).mockReturnValue({
      currentFact: 'Cats are cool',
      nextFact: mockNextFact,
      isTalking: false,
      setTalking: mockSetTalking,
      isVisible: true,
      setVisible: mockSetVisible,
    });
    (usePetAnim as unknown as jest.Mock).mockReturnValue({
      lottieRef: { current: { play: jest.fn() } },
    });
    (usePetDrag as unknown as jest.Mock).mockReturnValue({
      pan: { x: 0, y: 0, getLayout: () => ({ left: 0, top: 0 }) },
      panResponder: mockPanResponder,
    });
  });

  it('should render nothing if not visible', () => {
    // Arrange
    (usePetStore as unknown as jest.Mock).mockReturnValue({
      isVisible: false,
    });

    // Act
    const { toJSON } = render(<DesktopPet />);

    // Assert
    expect(toJSON()).toBeNull();
  });

  it('should render pet when visible', () => {
    // Arrange & Act
    const { toJSON } = render(<DesktopPet />);

    // Assert
    expect(toJSON()).toBeTruthy();
  });

  it('should show bubble when talking', () => {
    // Arrange
    (usePetStore as unknown as jest.Mock).mockReturnValue({
      currentFact: 'Cats are cool',
      isTalking: true,
      isVisible: true,
      setTalking: mockSetTalking,
      nextFact: mockNextFact,
    });

    // Act
    const { getByText } = render(<DesktopPet />);

    // Assert
    expect(getByText('Cats are cool')).toBeTruthy();
  });
});
