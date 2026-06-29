import { generateUrl } from '@bridgeflow/core/components/hooks/bridgeflow/use-share-url';
import { WorkspaceServerService } from '@bridgeflow/core/modules/cloud';
import { resolveLinkToDoc } from '@bridgeflow/core/modules/navigation/utils';
import { WorkspaceService } from '@bridgeflow/core/modules/workspace';
import { type ReferenceParams } from '@blocksuite/bridgeflow/model';
import {
  GenerateDocUrlExtension,
  ParseDocUrlExtension,
} from '@blocksuite/bridgeflow/shared/services';
import type { FrameworkProvider } from '@toeverything/infra';

function patchParseDocUrlExtension(framework: FrameworkProvider) {
  const workspaceService = framework.get(WorkspaceService);
  const workspaceServerService = framework.get(WorkspaceServerService);
  const baseUrl = workspaceServerService.server?.baseUrl ?? location.origin;
  const ParseDocUrl = ParseDocUrlExtension({
    parseDocUrl(url) {
      const info = resolveLinkToDoc(url, baseUrl);
      if (!info || info.workspaceId !== workspaceService.workspace.id) return;

      delete info.refreshKey;

      return info;
    },
  });

  return ParseDocUrl;
}

function patchGenerateDocUrlExtension(framework: FrameworkProvider) {
  const workspaceService = framework.get(WorkspaceService);
  const workspaceServerService = framework.get(WorkspaceServerService);
  const baseUrl = workspaceServerService.server?.baseUrl ?? location.origin;
  const GenerateDocUrl = GenerateDocUrlExtension({
    generateDocUrl(pageId: string, params?: ReferenceParams) {
      return generateUrl({
        ...params,
        pageId,
        workspaceId: workspaceService.workspace.id,
        baseUrl,
      });
    },
  });

  return GenerateDocUrl;
}

export function patchDocUrlExtensions(framework: FrameworkProvider) {
  return [
    patchParseDocUrlExtension(framework),
    patchGenerateDocUrlExtension(framework),
  ];
}
