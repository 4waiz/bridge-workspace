import { CloudViewExtension } from '@bridgeflow/core/blocksuite/view-extensions/cloud';
import { BridgeFlowEditorViewExtension } from '@bridgeflow/core/blocksuite/view-extensions/editor-view/editor-view';
import { BridgeFlowThemeViewExtension } from '@bridgeflow/core/blocksuite/view-extensions/theme';
import { I18n } from '@bridgeflow/i18n';
import { CodeBlockViewExtension } from '@blocksuite/bridgeflow/blocks/code/view';
import { DividerViewExtension } from '@blocksuite/bridgeflow/blocks/divider/view';
import { LatexViewExtension as LatexBlockViewExtension } from '@blocksuite/bridgeflow/blocks/latex/view';
import { ListViewExtension } from '@blocksuite/bridgeflow/blocks/list/view';
import { NoteViewExtension } from '@blocksuite/bridgeflow/blocks/note/view';
import { ParagraphViewExtension } from '@blocksuite/bridgeflow/blocks/paragraph/view';
import { RootViewExtension } from '@blocksuite/bridgeflow/blocks/root/view';
import {
  PeekViewExtension,
  type PeekViewService,
} from '@blocksuite/bridgeflow/components/peek';
import {
  type ViewExtensionContext,
  ViewExtensionManager,
  ViewExtensionProvider,
} from '@blocksuite/bridgeflow/ext-loader';
import { PlainTextClipboardConfig } from '@blocksuite/bridgeflow/foundation/clipboard';
import { LatexInlineSpecExtension } from '@blocksuite/bridgeflow/inlines/latex';
import { LatexViewExtension as LatexInlineViewExtension } from '@blocksuite/bridgeflow/inlines/latex/view';
import { LinkInlineSpecExtension } from '@blocksuite/bridgeflow/inlines/link';
import { LinkViewExtension } from '@blocksuite/bridgeflow/inlines/link/view';
import { MentionInlineSpecExtension } from '@blocksuite/bridgeflow/inlines/mention';
import { MentionViewExtension } from '@blocksuite/bridgeflow/inlines/mention/view';
import {
  BackgroundInlineSpecExtension,
  BoldInlineSpecExtension,
  CodeInlineSpecExtension,
  ColorInlineSpecExtension,
  InlineSpecExtensions,
  ItalicInlineSpecExtension,
  StrikeInlineSpecExtension,
  UnderlineInlineSpecExtension,
} from '@blocksuite/bridgeflow/inlines/preset';
import { ReferenceInlineSpecExtension } from '@blocksuite/bridgeflow/inlines/reference';
import { ReferenceViewExtension } from '@blocksuite/bridgeflow/inlines/reference/view';
import {
  DefaultOpenDocExtension,
  DocDisplayMetaService,
  DocModeService,
  FileSizeLimitService,
  FontConfigExtension,
  fontConfigSchema,
  FontLoaderService,
  PageViewportServiceExtension,
  ThemeService,
  ToolbarRegistryExtension,
} from '@blocksuite/bridgeflow/shared/services';
import type { BridgeFlowTextAttributes } from '@blocksuite/bridgeflow/shared/types';
import { InlineManagerExtension } from '@blocksuite/bridgeflow/std/inline';
import { LinkedDocViewExtension } from '@blocksuite/bridgeflow/widgets/linked-doc/view';
import { ToolbarViewExtension } from '@blocksuite/bridgeflow/widgets/toolbar/view';
import { ViewportOverlayViewExtension } from '@blocksuite/bridgeflow/widgets/viewport-overlay/view';
import type { FrameworkProvider } from '@kanban-studios/infra';
import { z } from 'zod';

import { createCommentLinkedWidgetConfig } from './linked-widget-config';

const commentEditorViewExtensionOptionsSchema = z.object({
  peekView: z.optional(z.custom<PeekViewService>()),
  fontConfig: z.optional(z.array(fontConfigSchema)),
});

export type CommentEditorViewExtensionOptions = z.infer<
  typeof commentEditorViewExtensionOptionsSchema
>;

class CommentEditorViewExtensionProvider extends ViewExtensionProvider<CommentEditorViewExtensionOptions> {
  override name = 'comment-editor';

  override schema = commentEditorViewExtensionOptionsSchema;

  override setup(
    context: ViewExtensionContext,
    options?: CommentEditorViewExtensionOptions
  ) {
    super.setup(context, options);
    context.register([
      ThemeService,
      DocModeService,
      DocDisplayMetaService,
      DefaultOpenDocExtension,
      FontLoaderService,
      ToolbarRegistryExtension,
      PageViewportServiceExtension,
      FileSizeLimitService,

      ...InlineSpecExtensions,
      InlineManagerExtension<BridgeFlowTextAttributes>({
        id: 'DefaultInlineManager',
        specs: [
          BoldInlineSpecExtension.identifier,
          ItalicInlineSpecExtension.identifier,
          UnderlineInlineSpecExtension.identifier,
          StrikeInlineSpecExtension.identifier,
          CodeInlineSpecExtension.identifier,
          BackgroundInlineSpecExtension.identifier,
          ColorInlineSpecExtension.identifier,
          LatexInlineSpecExtension.identifier,
          ReferenceInlineSpecExtension.identifier,
          LinkInlineSpecExtension.identifier,
          MentionInlineSpecExtension.identifier,
        ],
      }),

      PlainTextClipboardConfig,
    ]);

    if (options?.fontConfig) {
      context.register(FontConfigExtension(options.fontConfig));
    }
    if (options?.peekView) {
      context.register(PeekViewExtension(options.peekView));
    }
  }
}

let manager: ViewExtensionManager | null = null;
export function getCommentEditorViewManager(framework: FrameworkProvider) {
  if (!manager) {
    manager = new ViewExtensionManager([
      CommentEditorViewExtensionProvider,

      // Blocks
      CodeBlockViewExtension,
      DividerViewExtension,
      LatexBlockViewExtension,
      ListViewExtension,

      NoteViewExtension,
      ParagraphViewExtension,
      RootViewExtension,

      // Inline
      LinkViewExtension,
      ReferenceViewExtension,
      MentionViewExtension,
      LatexInlineViewExtension,

      // Widget
      ToolbarViewExtension,
      ViewportOverlayViewExtension,
      LinkedDocViewExtension,

      // BridgeFlow side
      BridgeFlowThemeViewExtension,
      BridgeFlowEditorViewExtension,

      // for rendering mentions
      CloudViewExtension,
    ]);

    manager.configure(ParagraphViewExtension, {
      getPlaceholder: () => {
        return I18n.t('com.bridgeflow.notification.comment-prompt');
      },
    });

    manager.configure(
      LinkedDocViewExtension,
      createCommentLinkedWidgetConfig(framework)
    );

    manager.configure(CloudViewExtension, {
      framework,
      enableCloud: true,
    });
  }
  return manager;
}
