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
    Input: (p: any) => React.createElement(TextInput, p),
  };
});

// Icons
jest.mock('@tamagui/lucide-icons', () => ({ Search: 'Search', X: 'X' }));

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

  it('清空按钮点击会清空内容并回调', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(<GlassSearchBar onChangeText={onChangeText} />);

    const input = getByPlaceholderText('搜索话题、品种...');
    fireEvent.changeText(input, 'hello');
    expect(onChangeText).toHaveBeenCalledWith('hello');
    // 清空内容验证回调
    fireEvent.changeText(input, '');
    expect(onChangeText).toHaveBeenLastCalledWith('');
  });

  it('focus/blur 会触发回调', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const { getByPlaceholderText } = render(<GlassSearchBar onFocus={onFocus} onBlur={onBlur} />);
    const input = getByPlaceholderText('搜索话题、品种...');
    fireEvent(input, 'focus');
    fireEvent(input, 'blur');
    expect(onFocus).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
  });
});
