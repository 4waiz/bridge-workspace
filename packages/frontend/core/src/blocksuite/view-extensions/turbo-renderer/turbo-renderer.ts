import { getWorkerUrl } from '@bridgeflow/env/worker';
import { CodeLayoutHandlerExtension } from '@blocksuite/bridgeflow/blocks/code';
import { ImageLayoutHandlerExtension } from '@blocksuite/bridgeflow/blocks/image';
import { ListLayoutHandlerExtension } from '@blocksuite/bridgeflow/blocks/list';
import { NoteLayoutHandlerExtension } from '@blocksuite/bridgeflow/blocks/note';
import { ParagraphLayoutHandlerExtension } from '@blocksuite/bridgeflow/blocks/paragraph';
import {
  TurboRendererConfigFactory,
  ViewportTurboRendererExtension,
} from '@blocksuite/bridgeflow/gfx/turbo-renderer';

function createPainterWorker() {
  const worker = new Worker(getWorkerUrl('turbo-painter'));
  return worker;
}

export const turboRendererExtension = [
  ParagraphLayoutHandlerExtension,
  ListLayoutHandlerExtension,
  NoteLayoutHandlerExtension,
  CodeLayoutHandlerExtension,
  ImageLayoutHandlerExtension,
  TurboRendererConfigFactory({
    options: {
      zoomThreshold: 1,
      debounceTime: 1000,
    },
    painterWorkerEntry: createPainterWorker,
  }),
  ViewportTurboRendererExtension,
];
