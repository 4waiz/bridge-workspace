import { IconPickerServiceIdentifier } from '@blocksuite/bridgeflow/shared/services';
import { type ExtensionType } from '@blocksuite/bridgeflow/store';
import type { Container } from '@blocksuite/global/di';
import type { FrameworkProvider } from '@kanban-studios/infra';

import { IconPickerService } from '../../../modules/icon-picker/services/icon-picker';

/**
 * Patch the icon picker service to make it available in BlockSuite
 * @param framework
 * @returns
 */
export function patchIconPickerService(
  framework: FrameworkProvider
): ExtensionType {
  return {
    setup: (di: Container) => {
      di.override(IconPickerServiceIdentifier, () => {
        return framework.get(IconPickerService);
      });
    },
  };
}
