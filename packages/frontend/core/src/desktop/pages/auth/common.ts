import { z } from 'zod';

export const supportedClient = z.enum([
  'web',
  'bridgeflow',
  'bridgeflow-canary',
  'bridgeflow-beta',
  ...(BUILD_CONFIG.debug ? ['bridgeflow-dev'] : []),
]);
