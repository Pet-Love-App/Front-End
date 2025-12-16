import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Onboarding } from '@/src/components/Onboarding';

export default function OnboardingIndex() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Onboarding />
    </SafeAreaView>
  );
}
