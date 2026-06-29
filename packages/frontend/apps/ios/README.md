# iOS

BridgeFlow iOS app.

## Build

- `yarn install`
- `BUILD_TYPE=canary PUBLIC_PATH="/" yarn bridgeflow @bridgeflow/ios build`
- `yarn bridgeflow @bridgeflow/ios cap sync`
- `yarn bridgeflow @bridgeflow/ios cap open ios`

## Live Reload

> Capacitor doc: https://capacitorjs.com/docs/guides/live-reload#using-with-framework-clis

- `yarn install`
- `yarn dev`
  - select `ios` for the "Distribution" option
- `yarn bridgeflow @bridgeflow/ios sync:dev`
- `yarn bridgeflow @bridgeflow/ios cap open ios`
