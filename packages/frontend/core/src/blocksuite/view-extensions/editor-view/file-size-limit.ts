import { WorkspaceDialogService } from '@bridgeflow/core/modules/dialogs';
import track from '@bridgeflow/track';
import type { Container } from '@blocksuite/bridgeflow/global/di';
import {
  FileSizeLimitProvider,
  type IFileSizeLimitService,
} from '@blocksuite/bridgeflow/shared/services';
import { Extension } from '@blocksuite/bridgeflow/store';
import type { FrameworkProvider } from '@toeverything/infra';

export function patchFileSizeLimitExtension(framework: FrameworkProvider) {
  const workspaceDialogService = framework.get(WorkspaceDialogService);

  class BridgeFlowFileSizeLimitService
    extends Extension
    implements IFileSizeLimitService
  {
    // 2GB
    maxFileSize = 2 * 1024 * 1024 * 1024;

    onOverFileSize() {
      workspaceDialogService.open('setting', {
        activeTab: 'plans',
        scrollAnchor: 'cloudPricingPlan',
      });
      track.$.paywall.storage.viewPlans();
    }

    static override setup(di: Container) {
      di.override(FileSizeLimitProvider, BridgeFlowFileSizeLimitService);
    }
  }

  return BridgeFlowFileSizeLimitService;
}
