import { registerPlugin } from '@capacitor/core';

import type { BridgeFlowThemePlugin } from './definitions';

const BridgeFlowTheme = registerPlugin<BridgeFlowThemePlugin>('BridgeFlowTheme');

export * from './definitions';
export { BridgeFlowTheme };
