import { AttachmentStoreExtension } from '@blocksuite/bridgeflow-block-attachment/store';
import { BookmarkStoreExtension } from '@blocksuite/bridgeflow-block-bookmark/store';
import { CalloutStoreExtension } from '@blocksuite/bridgeflow-block-callout/store';
import { CodeStoreExtension } from '@blocksuite/bridgeflow-block-code/store';
import { DataViewStoreExtension } from '@blocksuite/bridgeflow-block-data-view/store';
import { DatabaseStoreExtension } from '@blocksuite/bridgeflow-block-database/store';
import { DividerStoreExtension } from '@blocksuite/bridgeflow-block-divider/store';
import { EdgelessTextStoreExtension } from '@blocksuite/bridgeflow-block-edgeless-text/store';
import { EmbedStoreExtension } from '@blocksuite/bridgeflow-block-embed/store';
import { EmbedDocStoreExtension } from '@blocksuite/bridgeflow-block-embed-doc/store';
import { FrameStoreExtension } from '@blocksuite/bridgeflow-block-frame/store';
import { ImageStoreExtension } from '@blocksuite/bridgeflow-block-image/store';
import { LatexStoreExtension } from '@blocksuite/bridgeflow-block-latex/store';
import { ListStoreExtension } from '@blocksuite/bridgeflow-block-list/store';
import { NoteStoreExtension } from '@blocksuite/bridgeflow-block-note/store';
import { ParagraphStoreExtension } from '@blocksuite/bridgeflow-block-paragraph/store';
import { RootStoreExtension } from '@blocksuite/bridgeflow-block-root/store';
import { SurfaceStoreExtension } from '@blocksuite/bridgeflow-block-surface/store';
import { SurfaceRefStoreExtension } from '@blocksuite/bridgeflow-block-surface-ref/store';
import { TableStoreExtension } from '@blocksuite/bridgeflow-block-table/store';
import { FoundationStoreExtension } from '@blocksuite/bridgeflow-foundation/store';
import { BrushStoreExtension } from '@blocksuite/bridgeflow-gfx-brush/store';
import { ConnectorStoreExtension } from '@blocksuite/bridgeflow-gfx-connector/store';
import { GroupStoreExtension } from '@blocksuite/bridgeflow-gfx-group/store';
import { MindmapStoreExtension } from '@blocksuite/bridgeflow-gfx-mindmap/store';
import { ShapeStoreExtension } from '@blocksuite/bridgeflow-gfx-shape/store';
import { TextStoreExtension } from '@blocksuite/bridgeflow-gfx-text/store';
import { FootnoteStoreExtension } from '@blocksuite/bridgeflow-inline-footnote/store';
import { LatexStoreExtension as InlineLatexStoreExtension } from '@blocksuite/bridgeflow-inline-latex/store';
import { LinkStoreExtension } from '@blocksuite/bridgeflow-inline-link/store';
import { InlinePresetStoreExtension } from '@blocksuite/bridgeflow-inline-preset/store';
import { ReferenceStoreExtension } from '@blocksuite/bridgeflow-inline-reference/store';

export function getInternalStoreExtensions() {
  return [
    FoundationStoreExtension,

    AttachmentStoreExtension,
    BookmarkStoreExtension,
    CalloutStoreExtension,
    CodeStoreExtension,
    DataViewStoreExtension,
    DatabaseStoreExtension,
    DividerStoreExtension,
    EdgelessTextStoreExtension,
    EmbedStoreExtension,
    EmbedDocStoreExtension,
    FrameStoreExtension,
    ImageStoreExtension,
    LatexStoreExtension,
    ListStoreExtension,
    NoteStoreExtension,
    ParagraphStoreExtension,
    SurfaceRefStoreExtension,
    TableStoreExtension,
    SurfaceStoreExtension,
    RootStoreExtension,

    FootnoteStoreExtension,
    LinkStoreExtension,
    ReferenceStoreExtension,
    InlineLatexStoreExtension,
    InlinePresetStoreExtension,

    BrushStoreExtension,
    ShapeStoreExtension,
    MindmapStoreExtension,
    ConnectorStoreExtension,
    GroupStoreExtension,
    TextStoreExtension,
  ];
}
