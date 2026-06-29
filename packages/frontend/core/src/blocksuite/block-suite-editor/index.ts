import { registerAIEditorEffects } from '@bridgeflow/core/blocksuite/ai/effects/editor';
import { editorEffects } from '@bridgeflow/core/blocksuite/editors';

import { registerTemplates } from './register-templates';

editorEffects();
registerAIEditorEffects();
registerTemplates();

export * from './blocksuite-editor';
