import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AdminUpdatePrompt } from '../AdminUpdatePrompt';
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

describe('AdminUpdatePrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { getByText } = render(<AdminUpdatePrompt catfoodId={123} catfoodName="Test Food" />);

    expect(getByText('管理员权限')).toBeTruthy();
    expect(getByText('可以重新扫描并覆盖更新已有的营养成分数据')).toBeTruthy();
    expect(getByText('重新扫描更新')).toBeTruthy();
  });

  it('should navigate to scanner on press', () => {
    const { getByText } = render(<AdminUpdatePrompt catfoodId={123} catfoodName="Test Food" />);

    fireEvent.press(getByText('重新扫描更新'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(tabs)/scanner',
      params: {
        catfoodId: '123',
        catfoodName: 'Test Food',
        scanType: 'ingredients',
      },
    });
  });
});
