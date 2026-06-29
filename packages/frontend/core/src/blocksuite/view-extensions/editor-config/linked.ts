import { AtMenuConfigService } from '@bridgeflow/core/modules/at-menu-config/services';
import type { LinkedWidgetConfig } from '@blocksuite/bridgeflow/widgets/linked-doc';
import { type FrameworkProvider } from '@kanban-studios/infra';

export function createLinkedWidgetConfig(
  framework: FrameworkProvider
): Partial<LinkedWidgetConfig> | undefined {
  const service = framework.getOptional(AtMenuConfigService);
  if (!service) return;
  return service.getConfig();
}
