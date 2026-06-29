import { setupGlobal } from '@bridgeflow/env/global';
import { getBuildConfig } from '@bridgeflow-tools/utils/build-config';
import { Package } from '@bridgeflow-tools/utils/workspace';

globalThis.BUILD_CONFIG = getBuildConfig(new Package('@bridgeflow/web'), {
  mode: 'development',
  channel: 'canary',
});

if (typeof window !== 'undefined') {
  window.location.search = '?prefixUrl=http://127.0.0.1:3010/';
}

setupGlobal();
