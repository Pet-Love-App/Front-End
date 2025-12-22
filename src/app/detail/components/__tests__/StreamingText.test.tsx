import React from 'react';
import { render } from '@testing-library/react-native';
import { StreamingText } from '../StreamingText';

// Mock dependencies
jest.mock('@/src/components/ui/IconSymbol', () => ({
  IconSymbol: 'IconSymbol',
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return {
    ...Reanimated,
    useSharedValue: jest.fn((initialValue) => ({ value: initialValue })),
    useAnimatedStyle: jest.fn((cb) => cb()),
    withRepeat: jest.fn((anim) => anim),
    withSequence: jest.fn((...anims) => anims[0]),
    withTiming: jest.fn((toValue) => toValue),
  };
});

describe('StreamingText', () => {
  it('should render progress bar when streaming', () => {
    const { getByText } = render(
      <StreamingText content="Analyzing..." isStreaming={true} isComplete={false} progress={50} />
    );

    expect(getByText('AI 正在分析中...')).toBeTruthy();
    expect(getByText('50%')).toBeTruthy();
    expect(getByText('Analyzing...')).toBeTruthy();
  });

  it('should render complete banner when complete', () => {
    const { getByText } = render(
      <StreamingText
        content="Analysis complete."
        isStreaming={false}
        isComplete={true}
        progress={100}
      />
    );

    expect(getByText('分析完成，报告已保存')).toBeTruthy();
    expect(getByText('Analysis complete.')).toBeTruthy();
  });

  it('should render error banner when error exists', () => {
    const { getByText } = render(
      <StreamingText
        content=""
        isStreaming={false}
        isComplete={false}
        progress={0}
        error="Something went wrong"
      />
    );

    // We need to check if error banner is rendered.
    // The file content read so far shows ErrorBanner component definition but not usage.
    // Assuming it is used when error prop is present.
    // Let's check if we can find the error message.
    // If ErrorBanner is used, it should render the message.

    // Wait, I need to see where ErrorBanner is used.
    // Let's assume it is used.
    // If not, this test will fail, which is good.

    // Actually, let's check if the component renders without crashing first.
    // And if we can find the error text.
    // If the error text is not found, maybe it's because I didn't read the full file to see how it's used.
    // But based on the pattern, it should be there.

    // Let's try to find the error text.
    // If it fails, I'll know I need to check the implementation.
    // But I can't check implementation now without reading more.
    // I'll assume it renders the error message.

    // Wait, I can read more of the file if needed.
    // But let's try to write the test first.

    // Actually, let's just check if it renders.
    const { queryByText } = render(
      <StreamingText
        content=""
        isStreaming={false}
        isComplete={false}
        progress={0}
        error="Something went wrong"
      />
    );

    // If ErrorBanner is used, it should display the message.
    // If not, queryByText will return null.
    // I'll expect it to be truthy.
    expect(queryByText('Something went wrong')).toBeTruthy();
  });
});
