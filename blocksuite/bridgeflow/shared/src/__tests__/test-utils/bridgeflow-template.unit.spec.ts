import { TextSelection } from '@blocksuite/std';
import { describe, expect, it } from 'vitest';

import { bridgeflow } from '../../test-utils';

describe('helpers/bridgeflow-template', () => {
  it('should create a basic document structure from template', () => {
    const host = bridgeflow`
      <bridgeflow-page id="page">
        <bridgeflow-note id="note">
          <bridgeflow-paragraph id="paragraph-1">Hello, world</bridgeflow-paragraph>
        </bridgeflow-note>
      </bridgeflow-page>
    `;

    expect(host.store).toBeDefined();

    const pageBlock = host.store.getBlock('page');
    expect(pageBlock).toBeDefined();
    expect(pageBlock?.flavour).toBe('bridgeflow:page');

    const noteBlock = host.store.getBlock('note');
    expect(noteBlock).toBeDefined();
    expect(noteBlock?.flavour).toBe('bridgeflow:note');

    const paragraphBlock = host.store.getBlock('paragraph-1');
    expect(paragraphBlock).toBeDefined();
    expect(paragraphBlock?.flavour).toBe('bridgeflow:paragraph');
  });

  it('should handle nested blocks correctly', () => {
    const host = bridgeflow`
      <bridgeflow-page>
        <bridgeflow-note>
          <bridgeflow-paragraph>First paragraph</bridgeflow-paragraph>
          <bridgeflow-list>List item</bridgeflow-list>
          <bridgeflow-paragraph>Second paragraph</bridgeflow-paragraph>
        </bridgeflow-note>
      </bridgeflow-page>
    `;

    const noteBlocks = host.store.getBlocksByFlavour('bridgeflow:note');
    const paragraphBlocks = host.store.getBlocksByFlavour('bridgeflow:paragraph');
    const listBlocks = host.store.getBlocksByFlavour('bridgeflow:list');

    expect(noteBlocks.length).toBe(1);
    expect(paragraphBlocks.length).toBe(2);
    expect(listBlocks.length).toBe(1);

    const noteBlock = noteBlocks[0];
    const noteChildren =
      host.store.getBlock(noteBlock.id)?.model.children || [];
    expect(noteChildren.length).toBe(3);

    expect(noteChildren[0].flavour).toBe('bridgeflow:paragraph');
    expect(noteChildren[1].flavour).toBe('bridgeflow:list');
    expect(noteChildren[2].flavour).toBe('bridgeflow:paragraph');
  });

  it('should handle empty blocks correctly', () => {
    const host = bridgeflow`
      <bridgeflow-page>
        <bridgeflow-note>
          <bridgeflow-paragraph></bridgeflow-paragraph>
        </bridgeflow-note>
      </bridgeflow-page>
    `;

    const paragraphBlocks = host.store.getBlocksByFlavour('bridgeflow:paragraph');
    expect(paragraphBlocks.length).toBe(1);

    const paragraphBlock = host.store.getBlock(paragraphBlocks[0].id);
    const paragraphText = paragraphBlock?.model.text?.toString() || '';
    expect(paragraphText).toBe('');
  });

  it('should throw error on invalid template', () => {
    expect(() => {
      bridgeflow`
        <unknown-tag></unknown-tag>
      `;
    }).toThrow();
  });

  it('should handle text selection with anchor and focus', () => {
    const host = bridgeflow`
      <bridgeflow-page id="page">
        <bridgeflow-note id="note">
          <bridgeflow-paragraph id="paragraph-1">Hel<anchor />lo</bridgeflow-paragraph>
          <bridgeflow-paragraph id="paragraph-2">Wo<focus />rld</bridgeflow-paragraph>
        </bridgeflow-note>
      </bridgeflow-page>
    `;

    const selection = host.selection.value[0] as TextSelection;
    expect(selection).toBeDefined();
    expect(selection.is(TextSelection)).toBe(true);
    expect(selection.from.blockId).toBe('paragraph-1');
    expect(selection.from.index).toBe(3);
    expect(selection.from.length).toBe(2);
    expect(selection.to?.blockId).toBe('paragraph-2');
    expect(selection.to?.index).toBe(0);
    expect(selection.to?.length).toBe(2);
  });

  it('should handle cursor position', () => {
    const host = bridgeflow`
      <bridgeflow-page id="page">
        <bridgeflow-note id="note">
          <bridgeflow-paragraph id="paragraph-1">Hello<cursor />World</bridgeflow-paragraph>
        </bridgeflow-note>
      </bridgeflow-page>
    `;

    const selection = host.selection.value[0] as TextSelection;
    expect(selection).toBeDefined();
    expect(selection.is(TextSelection)).toBe(true);
    expect(selection.from.blockId).toBe('paragraph-1');
    expect(selection.from.index).toBe(5);
    expect(selection.from.length).toBe(0);
    expect(selection.to).toBeNull();
  });

  it('should handle selection in empty blocks', () => {
    const host = bridgeflow`
      <bridgeflow-page id="page">
        <bridgeflow-note id="note">
          <bridgeflow-paragraph id="paragraph-1"><cursor /></bridgeflow-paragraph>
        </bridgeflow-note>
      </bridgeflow-page>
    `;

    const selection = host.selection.value[0] as TextSelection;
    expect(selection).toBeDefined();
    expect(selection.is(TextSelection)).toBe(true);
    expect(selection.from.blockId).toBe('paragraph-1');
    expect(selection.from.index).toBe(0);
    expect(selection.from.length).toBe(0);
    expect(selection.to).toBeNull();
  });

  it('should handle single point selection', () => {
    const host = bridgeflow`
      <bridgeflow-page id="page">
        <bridgeflow-note id="note">
          <bridgeflow-paragraph id="paragraph-1">Hello<anchor></anchor>World<focus></focus>BridgeFlow</bridgeflow-paragraph>
        </bridgeflow-note>
      </bridgeflow-page>
    `;

    const selection = host.selection.value[0] as TextSelection;
    expect(selection).toBeDefined();
    expect(selection.is(TextSelection)).toBe(true);
    expect(selection.from.blockId).toBe('paragraph-1');
    expect(selection.from.index).toBe(5);
    expect(selection.from.length).toBe(5);
    expect(selection.to).toBeNull();
  });
});
