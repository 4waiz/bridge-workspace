import type { FootNote, ReferenceInfo } from '@blocksuite/bridgeflow-model';
import type { InlineEditor } from '@blocksuite/std/inline';
import type { BlockModel } from '@blocksuite/store';
export * from './uni-component';

export type NoteChildrenFlavour =
  | 'bridgeflow:paragraph'
  | 'bridgeflow:list'
  | 'bridgeflow:code'
  | 'bridgeflow:divider'
  | 'bridgeflow:database'
  | 'bridgeflow:data-view'
  | 'bridgeflow:image'
  | 'bridgeflow:bookmark'
  | 'bridgeflow:attachment'
  | 'bridgeflow:surface-ref';

export interface Viewport {
  left: number;
  top: number;
  scrollLeft: number;
  scrollTop: number;
  scrollWidth: number;
  scrollHeight: number;
  clientWidth: number;
  clientHeight: number;
}

export type ExtendedModel = BlockModel & Record<string, any>;

export type IndentContext = {
  blockId: string;
  inlineIndex: number;
  flavour: string;
  type: 'indent' | 'dedent';
};

export type BridgeFlowTextStyleAttributes = {
  bold?: true | null;
  italic?: true | null;
  underline?: true | null;
  strike?: true | null;
  code?: true | null;
  color?: string | null;
  background?: string | null;
};

export type BridgeFlowTextAttributes = BridgeFlowTextStyleAttributes & {
  link?: string | null;
  reference?:
    | ({
        type: 'Subpage' | 'LinkedPage';
      } & ReferenceInfo)
    | null;
  latex?: string | null;
  footnote?: FootNote | null;
  mention?: {
    member: string;
    notification?: string;
  } | null;
  [key: `comment-${string}`]: boolean | null;
};

export type BridgeFlowInlineEditor = InlineEditor<BridgeFlowTextAttributes>;

export type SelectedRect = {
  left: number;
  top: number;
  width: number;
  height: number;
  borderWidth: number;
  borderStyle: string;
  rotate: number;
};
