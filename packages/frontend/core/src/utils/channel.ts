import { z } from 'zod';

export const appSchemes = z.enum([
  'bridgeflow',
  'bridgeflow-canary',
  'bridgeflow-beta',
  'bridgeflow-internal',
  'bridgeflow-dev',
]);

export type Scheme = z.infer<typeof appSchemes>;
export type Channel = 'stable' | 'canary' | 'beta' | 'internal';

export const schemeToChannel = {
  bridgeflow: 'stable',
  'bridgeflow-canary': 'canary',
  'bridgeflow-beta': 'beta',
  'bridgeflow-internal': 'internal',
  'bridgeflow-dev': 'canary', // dev does not have a dedicated app. use canary as the placeholder.
} as Record<Scheme, Channel>;

export const channelToScheme = {
  stable: 'bridgeflow',
  canary: BUILD_CONFIG.debug ? 'bridgeflow-dev' : 'bridgeflow-canary',
  beta: 'bridgeflow-beta',
  internal: 'bridgeflow-internal',
} as Record<Channel, Scheme>;

export const appIconMap = {
  stable: '/imgs/bridge-logo.webp',
  canary: '/imgs/bridge-logo.webp',
  beta: '/imgs/bridge-logo.webp',
  internal: '/imgs/bridge-logo.webp',
} satisfies Record<Channel, string>;

export const appNames = {
  stable: 'BRIDGE Flow',
  canary: 'BRIDGE Flow Canary',
  beta: 'BRIDGE Flow Beta',
  internal: 'BRIDGE Flow Internal',
} satisfies Record<Channel, string>;

export const appSchemaUrl = z.custom<string>(
  (url: string) => {
    try {
      return appSchemes.safeParse(new URL(url).protocol.replace(':', ''))
        .success;
    } catch {
      return false;
    }
  },
  { message: 'Invalid URL or protocol' }
);
