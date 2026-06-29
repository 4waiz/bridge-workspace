import { builtInTemplates as builtInEdgelessTemplates } from '@bridgeflow/templates/edgeless';
import { builtInTemplates as builtInStickersTemplates } from '@bridgeflow/templates/stickers';
import {
  EdgelessTemplatePanel,
  type TemplateManager,
} from '@blocksuite/bridgeflow/gfx/template';

export function registerTemplates() {
  EdgelessTemplatePanel.templates.extend(
    builtInStickersTemplates as TemplateManager
  );
  EdgelessTemplatePanel.templates.extend(
    builtInEdgelessTemplates as TemplateManager
  );
}
