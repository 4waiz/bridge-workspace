import type { Configuration as RspackDevServerConfiguration } from '@rspack/dev-server';

export const RSPACK_SUPPORTED_PACKAGES = [
  '@bridgeflow/admin',
  '@bridgeflow/web',
  '@bridgeflow/mobile',
  '@bridgeflow/ios',
  '@bridgeflow/android',
  '@bridgeflow/electron-renderer',
  '@bridgeflow/server',
  '@bridgeflow/reader',
] as const;

const rspackSupportedPackageSet = new Set<string>(RSPACK_SUPPORTED_PACKAGES);

export function isRspackSupportedPackageName(name: string) {
  return rspackSupportedPackageSet.has(name);
}

export function assertRspackSupportedPackageName(name: string) {
  if (isRspackSupportedPackageName(name)) {
    return;
  }

  throw new Error(
    `Rspack bundling currently supports: ${Array.from(RSPACK_SUPPORTED_PACKAGES).join(', ')}. Unsupported package: ${name}.`
  );
}

const IN_CI = !!process.env.CI;
const httpProxyMiddlewareLogLevel = IN_CI ? 'silent' : 'error';
const enableBackendProxy =
  process.env.SELF_HOSTED === 'true' ||
  process.env.ENABLE_BACKEND_PROXY === 'true';

export const DEFAULT_DEV_SERVER_CONFIG: RspackDevServerConfiguration = {
  host: '0.0.0.0',
  allowedHosts: 'all',
  hot: false,
  liveReload: true,
  compress: !process.env.CI,
  setupExitSignals: true,
  client: {
    overlay: process.env.DISABLE_DEV_OVERLAY === 'true' ? false : undefined,
    logging: process.env.CI ? 'none' : 'error',
    // see: https://webpack.js.org/configuration/dev-server/#websocketurl
    // must be an explicit ws/wss URL because custom protocols (e.g. assets://)
    // cannot be used to construct WebSocket endpoints in Electron
    webSocketURL: 'ws://0.0.0.0:8080/ws',
  },
  historyApiFallback: {
    rewrites: [
      {
        from: /.*/,
        to: () => {
          return process.env.SELF_HOSTED === 'true'
            ? '/selfhost.html'
            : '/index.html';
        },
      },
    ],
  },
  proxy: enableBackendProxy
    ? [
        {
          context: '/api',
          target: 'http://localhost:3010',
          logLevel: httpProxyMiddlewareLogLevel,
        },
        {
          context: '/socket.io',
          target: 'http://localhost:3010',
          ws: true,
          logLevel: httpProxyMiddlewareLogLevel,
        },
        {
          context: '/graphql',
          target: 'http://localhost:3010',
          logLevel: httpProxyMiddlewareLogLevel,
        },
      ]
    : undefined,
};
