import { SurfaceBlockModel } from '@blocksuite/bridgeflow-block-surface';
import { FileDropConfigExtension } from '@blocksuite/bridgeflow-components/drop-indicator';
import { AttachmentBlockSchema } from '@blocksuite/bridgeflow-model';
import { TelemetryProvider } from '@blocksuite/bridgeflow-shared/services';
import {
  isInsideEdgelessEditor,
  matchModels,
} from '@blocksuite/bridgeflow-shared/utils';
import { GfxControllerIdentifier } from '@blocksuite/std/gfx';

import { addAttachments, addSiblingAttachmentBlocks } from './utils.js';

export const AttachmentDropOption = FileDropConfigExtension({
  flavour: AttachmentBlockSchema.model.flavour,
  onDrop: ({ files, targetModel, placement, point, std }) => {
    // generic attachment block for all files except images
    const attachmentFiles = files.filter(
      file => !file.type.startsWith('image/')
    );
    if (!attachmentFiles.length) return false;

    if (targetModel && !matchModels(targetModel, [SurfaceBlockModel])) {
      addSiblingAttachmentBlocks(
        std,
        attachmentFiles,
        targetModel,
        placement
      ).catch(console.error);

      return true;
    }

    if (isInsideEdgelessEditor(std.host)) {
      const gfx = std.get(GfxControllerIdentifier);
      point = gfx.viewport.toViewCoordFromClientCoord(point);
      addAttachments(std, attachmentFiles, point).catch(console.error);

      std.getOptional(TelemetryProvider)?.track('CanvasElementAdded', {
        control: 'canvas:drop',
        page: 'whiteboard editor',
        module: 'toolbar',
        segment: 'toolbar',
        type: 'attachment',
      });

      return true;
    }

    return false;
  },
});
