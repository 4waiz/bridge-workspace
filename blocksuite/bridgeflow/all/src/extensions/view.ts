import { AttachmentViewExtension } from '@blocksuite/bridgeflow-block-attachment/view';
import { BookmarkViewExtension } from '@blocksuite/bridgeflow-block-bookmark/view';
import { CalloutViewExtension } from '@blocksuite/bridgeflow-block-callout/view';
import { CodeBlockViewExtension } from '@blocksuite/bridgeflow-block-code/view';
import { DataViewViewExtension } from '@blocksuite/bridgeflow-block-data-view/view';
import { DatabaseViewExtension } from '@blocksuite/bridgeflow-block-database/view';
import { DividerViewExtension } from '@blocksuite/bridgeflow-block-divider/view';
import { EdgelessTextViewExtension } from '@blocksuite/bridgeflow-block-edgeless-text/view';
import { EmbedViewExtension } from '@blocksuite/bridgeflow-block-embed/view';
import { EmbedDocViewExtension } from '@blocksuite/bridgeflow-block-embed-doc/view';
import { FrameViewExtension } from '@blocksuite/bridgeflow-block-frame/view';
import { ImageViewExtension } from '@blocksuite/bridgeflow-block-image/view';
import { LatexViewExtension } from '@blocksuite/bridgeflow-block-latex/view';
import { ListViewExtension } from '@blocksuite/bridgeflow-block-list/view';
import { NoteViewExtension } from '@blocksuite/bridgeflow-block-note/view';
import { ParagraphViewExtension } from '@blocksuite/bridgeflow-block-paragraph/view';
import { RootViewExtension } from '@blocksuite/bridgeflow-block-root/view';
import { SurfaceViewExtension } from '@blocksuite/bridgeflow-block-surface/view';
import { SurfaceRefViewExtension } from '@blocksuite/bridgeflow-block-surface-ref/view';
import { TableViewExtension } from '@blocksuite/bridgeflow-block-table/view';
import { FoundationViewExtension } from '@blocksuite/bridgeflow-foundation/view';
import { AdapterPanelViewExtension } from '@blocksuite/bridgeflow-fragment-adapter-panel/view';
import { DocTitleViewExtension } from '@blocksuite/bridgeflow-fragment-doc-title/view';
import { FramePanelViewExtension } from '@blocksuite/bridgeflow-fragment-frame-panel/view';
import { OutlineViewExtension } from '@blocksuite/bridgeflow-fragment-outline/view';
import { BrushViewExtension } from '@blocksuite/bridgeflow-gfx-brush/view';
import { ConnectorViewExtension } from '@blocksuite/bridgeflow-gfx-connector/view';
import { GroupViewExtension } from '@blocksuite/bridgeflow-gfx-group/view';
import { LinkViewExtension as GfxLinkViewExtension } from '@blocksuite/bridgeflow-gfx-link/view';
import { MindmapViewExtension } from '@blocksuite/bridgeflow-gfx-mindmap/view';
import { NoteViewExtension as GfxNoteViewExtension } from '@blocksuite/bridgeflow-gfx-note/view';
import { PointerViewExtension } from '@blocksuite/bridgeflow-gfx-pointer/view';
import { ShapeViewExtension } from '@blocksuite/bridgeflow-gfx-shape/view';
import { TemplateViewExtension } from '@blocksuite/bridgeflow-gfx-template/view';
import { TextViewExtension } from '@blocksuite/bridgeflow-gfx-text/view';
import { InlineCommentViewExtension } from '@blocksuite/bridgeflow-inline-comment/view';
import { FootnoteViewExtension } from '@blocksuite/bridgeflow-inline-footnote/view';
import { LatexViewExtension as InlineLatexViewExtension } from '@blocksuite/bridgeflow-inline-latex/view';
import { LinkViewExtension } from '@blocksuite/bridgeflow-inline-link/view';
import { MentionViewExtension } from '@blocksuite/bridgeflow-inline-mention/view';
import { InlinePresetViewExtension } from '@blocksuite/bridgeflow-inline-preset/view';
import { ReferenceViewExtension } from '@blocksuite/bridgeflow-inline-reference/view';
import { DragHandleViewExtension } from '@blocksuite/bridgeflow-widget-drag-handle/view';
import { EdgelessAutoConnectViewExtension } from '@blocksuite/bridgeflow-widget-edgeless-auto-connect/view';
import { EdgelessDraggingAreaViewExtension } from '@blocksuite/bridgeflow-widget-edgeless-dragging-area/view';
import { EdgelessSelectedRectViewExtension } from '@blocksuite/bridgeflow-widget-edgeless-selected-rect/view';
import { EdgelessToolbarViewExtension } from '@blocksuite/bridgeflow-widget-edgeless-toolbar/view';
import { EdgelessZoomToolbarViewExtension } from '@blocksuite/bridgeflow-widget-edgeless-zoom-toolbar/view';
import { FrameTitleViewExtension } from '@blocksuite/bridgeflow-widget-frame-title/view';
import { KeyboardToolbarViewExtension } from '@blocksuite/bridgeflow-widget-keyboard-toolbar/view';
import { LinkedDocViewExtension } from '@blocksuite/bridgeflow-widget-linked-doc/view';
import { NoteSlicerViewExtension } from '@blocksuite/bridgeflow-widget-note-slicer/view';
import { PageDraggingAreaViewExtension } from '@blocksuite/bridgeflow-widget-page-dragging-area/view';
import { RemoteSelectionViewExtension } from '@blocksuite/bridgeflow-widget-remote-selection/view';
import { ScrollAnchoringViewExtension } from '@blocksuite/bridgeflow-widget-scroll-anchoring/view';
import { SlashMenuViewExtension } from '@blocksuite/bridgeflow-widget-slash-menu/view';
import { ToolbarViewExtension } from '@blocksuite/bridgeflow-widget-toolbar/view';
import { ViewportOverlayViewExtension } from '@blocksuite/bridgeflow-widget-viewport-overlay/view';

export function getInternalViewExtensions() {
  return [
    FoundationViewExtension,

    // Gfx
    PointerViewExtension,
    GfxNoteViewExtension,
    BrushViewExtension,
    ShapeViewExtension,
    MindmapViewExtension,
    ConnectorViewExtension,
    GroupViewExtension,
    TextViewExtension,
    TemplateViewExtension,
    GfxLinkViewExtension,

    // Block
    AttachmentViewExtension,
    BookmarkViewExtension,
    CalloutViewExtension,
    CodeBlockViewExtension,
    DataViewViewExtension,
    DatabaseViewExtension,
    DividerViewExtension,
    EdgelessTextViewExtension,
    EmbedViewExtension,
    EmbedDocViewExtension,
    FrameViewExtension,
    ImageViewExtension,
    LatexViewExtension,
    ListViewExtension,
    NoteViewExtension,
    ParagraphViewExtension,
    SurfaceRefViewExtension,
    TableViewExtension,
    SurfaceViewExtension,
    RootViewExtension,

    // Inline
    InlineCommentViewExtension,
    FootnoteViewExtension,
    LinkViewExtension,
    ReferenceViewExtension,
    InlineLatexViewExtension,
    MentionViewExtension,
    InlinePresetViewExtension,

    // Widget
    // order will affect the z-index of the widget
    DragHandleViewExtension,
    EdgelessAutoConnectViewExtension,
    FrameTitleViewExtension,
    KeyboardToolbarViewExtension,
    LinkedDocViewExtension,
    RemoteSelectionViewExtension,
    ScrollAnchoringViewExtension,
    SlashMenuViewExtension,
    ToolbarViewExtension,
    ViewportOverlayViewExtension,
    EdgelessZoomToolbarViewExtension,
    PageDraggingAreaViewExtension,
    EdgelessSelectedRectViewExtension,
    EdgelessDraggingAreaViewExtension,
    NoteSlicerViewExtension,
    EdgelessToolbarViewExtension,

    // Fragment
    DocTitleViewExtension,
    FramePanelViewExtension,
    OutlineViewExtension,
    AdapterPanelViewExtension,
  ];
}
