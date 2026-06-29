import {
  BRIDGEFLOW_FLAGS,
  type FeatureFlagService,
} from '@bridgeflow/core/modules/feature-flag';
import { FeatureFlagService as BSFeatureFlagService } from '@blocksuite/bridgeflow/shared/services';
import { type ExtensionType, StoreExtension } from '@blocksuite/bridgeflow/store';

export function getFeatureFlagSyncer(
  featureFlagService: FeatureFlagService
): ExtensionType {
  class FeatureFlagSyncer extends StoreExtension {
    static override key = 'feature-flag-syncer';

    override loaded() {
      const bsFeatureFlagService = this.store.get(BSFeatureFlagService);
      Object.entries(BRIDGEFLOW_FLAGS).forEach(([key, flag]) => {
        if (flag.category === 'blocksuite') {
          const value =
            featureFlagService.flags[key as keyof BRIDGEFLOW_FLAGS].value;
          if (value !== undefined) {
            bsFeatureFlagService.setFlag(flag.bsFlag, value);
          }
        }
      });
    }
  }

  return FeatureFlagSyncer;
}
