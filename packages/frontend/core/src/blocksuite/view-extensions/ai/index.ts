import { toolbarAIEntryConfig } from '@bridgeflow/core/blocksuite/ai';
import { AIChatBlockSpec } from '@bridgeflow/core/blocksuite/ai/blocks';
import { AITranscriptionBlockSpec } from '@bridgeflow/core/blocksuite/ai/blocks/ai-chat-block/ai-transcription-block';
import { edgelessToolbarAIEntryConfig } from '@bridgeflow/core/blocksuite/ai/entries/edgeless';
import { imageToolbarAIEntryConfig } from '@bridgeflow/core/blocksuite/ai/entries/image-toolbar/setup-image-toolbar';
import { AICodeBlockWatcher } from '@bridgeflow/core/blocksuite/ai/extensions/ai-code';
import { getAIEdgelessRootWatcher } from '@bridgeflow/core/blocksuite/ai/extensions/ai-edgeless-root';
import { getAIPageRootWatcher } from '@bridgeflow/core/blocksuite/ai/extensions/ai-page-root';
import { AiSlashMenuConfigExtension } from '@bridgeflow/core/blocksuite/ai/extensions/ai-slash-menu';
import { CopilotTool } from '@bridgeflow/core/blocksuite/ai/tool/copilot-tool';
import { aiPanelWidget } from '@bridgeflow/core/blocksuite/ai/widgets/ai-panel/ai-panel';
import { edgelessCopilotWidget } from '@bridgeflow/core/blocksuite/ai/widgets/edgeless-copilot';
import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@blocksuite/bridgeflow/ext-loader';
import { ToolbarModuleExtension } from '@blocksuite/bridgeflow/shared/services';
import { BlockFlavourIdentifier } from '@blocksuite/bridgeflow/std';
import { FrameworkProvider } from '@toeverything/infra';
import { z } from 'zod';

import {
  BlockDiffService,
  BlockDiffWatcher,
} from '../../ai/services/block-diff';
import { blockDiffWidgetForBlock } from '../../ai/widgets/block-diff/block';
import { blockDiffWidgetForPage } from '../../ai/widgets/block-diff/page';
import { EdgelessClipboardAIChatConfig } from './edgeless-clipboard';

const optionsSchema = z.object({
  enable: z.boolean().optional(),
  framework: z.instanceof(FrameworkProvider).optional(),
});

type AIViewOptions = z.infer<typeof optionsSchema>;

export class AIViewExtension extends ViewExtensionProvider<AIViewOptions> {
  override name = 'bridgeflow-ai-view-extension';

  override schema = optionsSchema;

  override setup(context: ViewExtensionContext, options?: AIViewOptions) {
    super.setup(context, options);
    if (!options?.enable) return;
    const framework = options.framework;
    if (!framework) return;

    context
      .register(AIChatBlockSpec)
      .register(AITranscriptionBlockSpec)
      .register(EdgelessClipboardAIChatConfig)
      .register(AICodeBlockWatcher)
      .register(
        ToolbarModuleExtension({
          id: BlockFlavourIdentifier('custom:bridgeflow:image'),
          config: imageToolbarAIEntryConfig(),
        })
      );

    if (context.scope === 'edgeless' || context.scope === 'page') {
      context.register([
        aiPanelWidget,
        AiSlashMenuConfigExtension(),
        ToolbarModuleExtension({
          id: BlockFlavourIdentifier('custom:bridgeflow:note'),
          config: toolbarAIEntryConfig(),
        }),
      ]);
    }
    if (context.scope === 'edgeless') {
      context.register([
        CopilotTool,
        edgelessCopilotWidget,
        getAIEdgelessRootWatcher(),
        // In note
        ToolbarModuleExtension({
          id: BlockFlavourIdentifier('custom:bridgeflow:surface:*'),
          config: edgelessToolbarAIEntryConfig(),
        }),
      ]);
    }
    if (context.scope === 'page') {
      context.register([
        blockDiffWidgetForPage,
        blockDiffWidgetForBlock,
        getAIPageRootWatcher(),
        BlockDiffService,
        BlockDiffWatcher,
      ]);
    }
  }
}
