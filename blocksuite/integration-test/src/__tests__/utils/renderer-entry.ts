import { ImageLayoutHandlerExtension } from '@blocksuite/bridgeflow/blocks/image';
import { ListLayoutHandlerExtension } from '@blocksuite/bridgeflow/blocks/list';
import { ParagraphLayoutHandlerExtension } from '@blocksuite/bridgeflow/blocks/paragraph';
import {
  TurboRendererConfigFactory,
  ViewportTurboRendererExtension,
  ViewportTurboRendererIdentifier,
} from '@blocksuite/bridgeflow/gfx/turbo-renderer';

import { addSampleNotes } from './doc-generator.js';
import { createPainterWorker, setupEditor } from './setup.js';

async function init() {
  await setupEditor('edgeless', [
    ParagraphLayoutHandlerExtension,
    ListLayoutHandlerExtension,
    ImageLayoutHandlerExtension,
    TurboRendererConfigFactory({
      painterWorkerEntry: createPainterWorker,
    }),
    ViewportTurboRendererExtension,
  ]);
  addSampleNotes(doc, 100);
  doc.load();

  const renderer = editor.std.get(
    ViewportTurboRendererIdentifier
  ) as ViewportTurboRendererExtension;
  window.renderer = renderer;
}

await init();
