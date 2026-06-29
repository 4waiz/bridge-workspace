import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import type { CapacitorConfig } from '@capacitor/cli';

const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, './package.json'), 'utf-8')
);

interface AppConfig {
  bridgeflowVersion: string;
}

const config: CapacitorConfig & AppConfig = {
  appId: 'app.bridgeflow.pro',
  appName: 'BridgeFlow',
  webDir: 'dist',
  bridgeflowVersion: packageJson.version,
  android: {
    path: 'App',
    buildOptions: {
      keystorePath: join(__dirname, 'bridgeflow.keystore'),
      keystorePassword: process.env.BRIDGEFLOW_ANDROID_KEYSTORE_PASSWORD,
      keystoreAlias: 'key0',
      keystoreAliasPassword: process.env.BRIDGEFLOW_ANDROID_KEYSTORE_ALIAS_PASSWORD,
      releaseType: 'AAB',
    },
    adjustMarginsForEdgeToEdge: 'force',
  },
  server: {
    cleartext: true,
  },
  plugins: {
    CapacitorHttp: {
      enabled: false,
    },
    CapacitorCookies: {
      enabled: false,
    },
  },
};

if (process.env.CAP_SERVER_URL) {
  Object.assign(config, {
    server: {
      url: process.env.CAP_SERVER_URL,
    },
  });
}

export default config;
