import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NutritionInputPrompt } from '../NutritionInputPrompt';
import { router } from 'expo-router';

// Mock dependencies
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('@/src/components/ui/IconSymbol', () => ({
  IconSymbol: 'IconSymbol',
}));

describe('NutritionInputPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { getByText } = render(
      <NutritionInputPrompt catfoodId={123} catfoodName="Test Food" />
    );

    expect(getByText('暂无营养成分信息，帮助完善数据')).toBeTruthy();
    expect(getByText('拍摄配料表')).toBeTruthy();
    expect(getByText('扫描条形码')).toBeTruthy();
  });

  it('should navigate to scanner for ingredients on press', () => {
    const { getByText } = render(
      <NutritionInputPrompt catfoodId={123} catfoodName="Test Food" />
    );

    fireEvent.press(getByText('拍摄配料表'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(tabs)/scanner',
      params: {
        catfoodId: '123',
        catfoodName: 'Test Food',
        scanType: 'ingredients',
      },
    });
  });

  it('should navigate to scanner for barcode on press', () => {
    const { getByText } = render(
      <NutritionInputPrompt catfoodId={123} catfoodName="Test Food" />
    );

    fireEvent.press(getByText('扫描条形码'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(tabs)/scanner',
      params: {
        catfoodId: '123',
        catfoodName: 'Test Food',
        scanType: 'barcode',
      },
    });
  });
});
