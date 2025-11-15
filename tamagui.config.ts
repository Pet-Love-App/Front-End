import { config as configBase } from '@tamagui/config/v3';
import { createTamagui } from '@tamagui/core';

export const tamaguiConfig = createTamagui(configBase);

type AppConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig;
