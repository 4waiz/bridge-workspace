import { DesktopApiService } from '@bridgeflow/core/modules/desktop-api';
import { NativeClipboardExtension } from '@blocksuite/bridgeflow/shared/services';
import type { FrameworkProvider } from '@kanban-studios/infra';

export function patchForClipboardInElectron(framework: FrameworkProvider) {
  const desktopApi = framework.get(DesktopApiService);
  return NativeClipboardExtension({
    copyAsPNG: desktopApi.handler.clipboard.copyAsPNG,
  });
}
