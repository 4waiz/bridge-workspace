import { ImageLayoutPainterExtension } from '@blocksuite/bridgeflow-block-image/turbo-painter';
import { ListLayoutPainterExtension } from '@blocksuite/bridgeflow-block-list/turbo-painter';
import { NoteLayoutPainterExtension } from '@blocksuite/bridgeflow-block-note/turbo-painter';
import { ParagraphLayoutPainterExtension } from '@blocksuite/bridgeflow-block-paragraph/turbo-painter';
import { ViewportLayoutPainter } from '@blocksuite/bridgeflow-gfx-turbo-renderer/painter';

new ViewportLayoutPainter([
  ParagraphLayoutPainterExtension,
  ListLayoutPainterExtension,
  NoteLayoutPainterExtension,
  ImageLayoutPainterExtension,
]);
