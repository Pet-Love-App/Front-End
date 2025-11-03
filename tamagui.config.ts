import { config } from '@tamagui/config/v3';
import { createTamagui } from 'tamagui';

export const tamaguiConfig = createTamagui(config);

type AppConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig;
