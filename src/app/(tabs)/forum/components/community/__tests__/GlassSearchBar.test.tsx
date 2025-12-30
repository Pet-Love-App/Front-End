import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

if (typeof navigator === 'undefined') {
  // @ts-ignore
  global.navigator = { userAgent: 'node.js' };
}
if (typeof (global as any).addEventListener === 'undefined') {
  (global as any).addEventListener = jest.fn();
}
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

// Lightweight tamagui mock
jest.mock('tamagui', () => {
  const React = require('react');
  const { View, TextInput } = require('react-native');
  const mk = (Comp: any) => (p: any) => React.createElement(Comp, p, p.children);
  return {
    styled: (Comp: any) => mk(Comp),
    XStack: mk(View),
    Stack: mk(View),
    Input: (p: any) => React.createElement(TextInput, { ...p, testID: 'search-input' }),
  };
});

// Icons
jest.mock('@tamagui/lucide-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Search: () => React.createElement(View, { testID: 'search-icon' }),
    X: () => React.createElement(View, { testID: 'clear-icon' }),
  };
});

const { GlassSearchBar } = require('../GlassSearchBar');

describe('GlassSearchBar', () => {
  it('渲染占位符并响应输入与提交', () => {
    const onChangeText = jest.fn();
    const onSubmit = jest.fn();
    const { getByPlaceholderText } = render(
      <GlassSearchBar onChangeText={onChangeText} onSubmit={onSubmit} />
    );

    const input = getByPlaceholderText('搜索话题、品种...');
    fireEvent.changeText(input, 'cat');
    expect(onChangeText).toHaveBeenCalledWith('cat');

    fireEvent(input, 'submitEditing');
    expect(onSubmit).toHaveBeenCalledWith('cat');
  });

  it('显示清空按钮并响应点击', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText, getByTestId, queryByTestId } = render(
      <GlassSearchBar onChangeText={onChangeText} />
    );

    const input = getByPlaceholderText('搜索话题、品种...');

    // 初始状态不应显示清空按钮
    expect(queryByTestId('clear-icon')).toBeNull();

    // 输入文本
    fireEvent.changeText(input, 'hello');
    expect(onChangeText).toHaveBeenCalledWith('hello');

    // 应该显示清空按钮
    const clearBtn = getByTestId('clear-icon');
    expect(clearBtn).toBeTruthy();

    // 点击清空按钮
    fireEvent.press(clearBtn);

    expect(onChangeText).toHaveBeenLastCalledWith('');

    // 清空后按钮应消失 (需要重新获取或检查状态，但由于是同步更新，应该立即消失)
    // 注意：fireEvent.press 触发状态更新后，React Testing Library 通常会重新渲染
    // 但这里我们检查的是 mock 的调用。
    // 如果要检查 UI 消失，可能需要 waitFor 或者直接检查 queryByTestId
    expect(queryByTestId('clear-icon')).toBeNull();
  });

  it('focus/blur 会触发回调', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const { getByPlaceholderText } = render(<GlassSearchBar onFocus={onFocus} onBlur={onBlur} />);
    const input = getByPlaceholderText('搜索话题、品种...');
    fireEvent(input, 'focus');
    expect(onFocus).toHaveBeenCalled();

    fireEvent(input, 'blur');
    expect(onBlur).toHaveBeenCalled();
  });
});
