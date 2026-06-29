import { getBuildConfig } from '@bridgeflow-tools/utils/build-config';
import { Package } from '@bridgeflow-tools/utils/workspace';

import { createApp } from './create-app';

globalThis.BUILD_CONFIG = getBuildConfig(new Package('@bridgeflow/web'), {
  mode: 'development',
  channel: 'canary',
});
// @ts-expect-error testing
globalThis.app = await createApp();
