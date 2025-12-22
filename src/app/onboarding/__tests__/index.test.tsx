import React from 'react';
import { render } from '@testing-library/react-native';
import OnboardingIndex from '../index';

// Mock Onboarding component
jest.mock('@/src/components/Onboarding', () => ({
  Onboarding: () => <></>,
}));

// Mock SafeAreaView
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('OnboardingIndex', () => {
  it('should render correctly', () => {
    const { toJSON } = render(<OnboardingIndex />);
    expect(toJSON()).toMatchSnapshot();
  });
});
