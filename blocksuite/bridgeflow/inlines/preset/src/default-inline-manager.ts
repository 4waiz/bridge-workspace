import { CommentInlineSpecExtension } from '@blocksuite/bridgeflow-inline-comment';
import { FootNoteInlineSpecExtension } from '@blocksuite/bridgeflow-inline-footnote';
import { LatexInlineSpecExtension } from '@blocksuite/bridgeflow-inline-latex';
import { LinkInlineSpecExtension } from '@blocksuite/bridgeflow-inline-link';
import { MentionInlineSpecExtension } from '@blocksuite/bridgeflow-inline-mention';
import { ReferenceInlineSpecExtension } from '@blocksuite/bridgeflow-inline-reference';
import type { BridgeFlowTextAttributes } from '@blocksuite/bridgeflow-shared/types';
import { InlineManagerExtension } from '@blocksuite/std/inline';

import {
  BackgroundInlineSpecExtension,
  BoldInlineSpecExtension,
  CodeInlineSpecExtension,
  ColorInlineSpecExtension,
  ItalicInlineSpecExtension,
  StrikeInlineSpecExtension,
  UnderlineInlineSpecExtension,
} from './inline-spec';

export const DefaultInlineManagerExtension =
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
      FootNoteInlineSpecExtension.identifier,
      MentionInlineSpecExtension.identifier,
      CommentInlineSpecExtension.identifier,
    ],
  });
