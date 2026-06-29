import {
  appEffectElementTags,
  editorEffectElementTags,
  sharedEffectElementTags,
} from '@bridgeflow/core/blocksuite/ai/effects/registry';
import { describe, expect, test } from 'vitest';

describe('ai effects registration split', () => {
  const editorTags = new Set<string>([
    ...editorEffectElementTags,
    ...sharedEffectElementTags,
  ]);
  const appTags = new Set<string>([
    ...appEffectElementTags,
    ...sharedEffectElementTags,
  ]);

  test('registerAIEditorEffects skips app-only elements', () => {
    expect(editorTags.has('bridgeflow-ai-chat')).toBe(true);
    expect(editorTags.has('chat-panel')).toBe(false);
    expect(editorTags.has('text-renderer')).toBe(true);
  });

  test('registerAIAppEffects skips editor-only elements', () => {
    expect(appTags.has('ai-chat-content')).toBe(true);
    expect(appTags.has('chat-panel')).toBe(false);
    expect(appTags.has('bridgeflow-ai-chat')).toBe(false);
    expect(appTags.has('text-renderer')).toBe(true);
  });
});
