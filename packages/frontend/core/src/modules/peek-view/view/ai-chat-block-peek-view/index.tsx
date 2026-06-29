import { toReactNode } from '@bridgeflow/component';
import { AIChatBlockPeekViewTemplate } from '@bridgeflow/core/blocksuite/ai';
import type { AIChatBlockModel } from '@bridgeflow/core/blocksuite/ai/blocks/ai-chat-block/model/ai-chat-model';
import { registerAIAppEffects } from '@bridgeflow/core/blocksuite/ai/effects/app';
import { useAIChatConfig } from '@bridgeflow/core/components/hooks/bridgeflow/use-ai-chat-config';
import { useAISubscribe } from '@bridgeflow/core/components/hooks/bridgeflow/use-ai-subscribe';
import {
  AIDraftService,
  AIToolsConfigService,
} from '@bridgeflow/core/modules/ai-button';
import { AIModelService } from '@bridgeflow/core/modules/ai-button/services/models';
import { ServerService, SubscriptionService } from '@bridgeflow/core/modules/cloud';
import { WorkspaceDialogService } from '@bridgeflow/core/modules/dialogs';
import { FeatureFlagService } from '@bridgeflow/core/modules/feature-flag';
import type { EditorHost } from '@blocksuite/bridgeflow/std';
import { useFramework } from '@kanban-studios/infra';
import { useMemo } from 'react';

registerAIAppEffects();

export type AIChatBlockPeekViewProps = {
  model: AIChatBlockModel;
  host: EditorHost;
};

export const AIChatBlockPeekView = ({
  model,
  host,
}: AIChatBlockPeekViewProps) => {
  const { docDisplayConfig, searchMenuConfig, reasoningConfig } =
    useAIChatConfig();

  const framework = useFramework();
  const serverService = framework.get(ServerService);
  const bridgeflowFeatureFlagService = framework.get(FeatureFlagService);
  const bridgeflowWorkspaceDialogService = framework.get(WorkspaceDialogService);
  const aiDraftService = framework.get(AIDraftService);
  const aiToolsConfigService = framework.get(AIToolsConfigService);
  const subscriptionService = framework.get(SubscriptionService);
  const aiModelService = framework.get(AIModelService);
  const handleAISubscribe = useAISubscribe();

  return useMemo(() => {
    const template = AIChatBlockPeekViewTemplate(
      model,
      host,
      docDisplayConfig,
      searchMenuConfig,
      reasoningConfig,
      serverService,
      bridgeflowFeatureFlagService,
      bridgeflowWorkspaceDialogService,
      aiDraftService,
      aiToolsConfigService,
      subscriptionService,
      aiModelService,
      handleAISubscribe
    );
    return toReactNode(template);
  }, [
    model,
    host,
    docDisplayConfig,
    searchMenuConfig,
    reasoningConfig,
    serverService,
    bridgeflowFeatureFlagService,
    bridgeflowWorkspaceDialogService,
    aiDraftService,
    aiToolsConfigService,
    subscriptionService,
    aiModelService,
    handleAISubscribe,
  ]);
};
