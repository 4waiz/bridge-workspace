import { PackageList, type PackageName } from './yarn';

export const PackageToDistribution = new Map<
  PackageName,
  BUILD_CONFIG_TYPE['distribution']
>([
  ['@bridgeflow/admin', 'admin'],
  ['@bridgeflow/web', 'web'],
  ['@bridgeflow/electron-renderer', 'desktop'],
  ['@bridgeflow/electron', 'desktop'],
  ['@bridgeflow/mobile', 'mobile'],
  ['@bridgeflow/ios', 'ios'],
  ['@bridgeflow/android', 'android'],
]);

export const AliasToPackage = new Map<string, PackageName>([
  ['admin', '@bridgeflow/admin'],
  ['web', '@bridgeflow/web'],
  ['electron', '@bridgeflow/electron'],
  ['desktop', '@bridgeflow/electron-renderer'],
  ['renderer', '@bridgeflow/electron-renderer'],
  ['mobile', '@bridgeflow/mobile'],
  ['ios', '@bridgeflow/ios'],
  ['android', '@bridgeflow/android'],
  ['server', '@bridgeflow/server'],
  ['gql', '@bridgeflow/graphql'],
  ...PackageList.map(
    pkg => [pkg.name.split('/').pop()!, pkg.name] as [string, PackageName]
  ),
]);
