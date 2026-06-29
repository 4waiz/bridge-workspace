import { CodeLayoutPainterExtension } from '@blocksuite/bridgeflow/blocks/code';
import { ImageLayoutPainterExtension } from '@blocksuite/bridgeflow/blocks/image';
import { ListLayoutPainterExtension } from '@blocksuite/bridgeflow/blocks/list';
import { NoteLayoutPainterExtension } from '@blocksuite/bridgeflow/blocks/note';
import { ParagraphLayoutPainterExtension } from '@blocksuite/bridgeflow/blocks/paragraph';
import { ViewportLayoutPainter } from '@blocksuite/bridgeflow/gfx/turbo-renderer';

new ViewportLayoutPainter([
  ParagraphLayoutPainterExtension,
  ListLayoutPainterExtension,
  NoteLayoutPainterExtension,
  CodeLayoutPainterExtension,
  ImageLayoutPainterExtension,
]);
