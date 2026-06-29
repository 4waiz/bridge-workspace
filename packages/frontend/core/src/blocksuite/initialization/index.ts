import type { DocCreateOptions } from '@bridgeflow/core/modules/doc/types';
import {
  NoteDisplayMode,
  type NoteProps,
  type ParagraphProps,
  type RootBlockProps,
} from '@blocksuite/bridgeflow/model';
import type { SurfaceBlockProps } from '@blocksuite/bridgeflow/std/gfx';
import { type Store, Text } from '@blocksuite/bridgeflow/store';

export interface DocProps {
  page?: Partial<RootBlockProps>;
  surface?: Partial<SurfaceBlockProps>;
  note?: Partial<NoteProps>;
  paragraph?: Partial<ParagraphProps>;
  onStoreLoad?: (
    doc: Store,
    props: {
      noteId: string;
      paragraphId: string;
      surfaceId: string;
    }
  ) => void;
}

export function initDocFromProps(
  doc: Store,
  props?: DocProps,
  options: DocCreateOptions = {}
) {
  doc.load(() => {
    const pageBlockId = doc.addBlock(
      'bridgeflow:page',
      props?.page || { title: new Text(options.title || '') }
    );
    const surfaceId = doc.addBlock(
      'bridgeflow:surface' as never,
      props?.surface || {},
      pageBlockId
    );
    const noteBlockId = doc.addBlock(
      'bridgeflow:note',
      {
        ...props?.note,
        displayMode: NoteDisplayMode.DocAndEdgeless,
      },
      pageBlockId
    );
    const paragraphBlockId = doc.addBlock(
      'bridgeflow:paragraph',
      props?.paragraph || {},
      noteBlockId
    );
    props?.onStoreLoad?.(doc, {
      noteId: noteBlockId,
      paragraphId: paragraphBlockId,
      surfaceId,
    });
    doc.history.undoManager.clear();
  });
}
