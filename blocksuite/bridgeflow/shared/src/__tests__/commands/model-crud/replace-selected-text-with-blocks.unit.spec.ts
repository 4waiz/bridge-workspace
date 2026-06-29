/**
 * @vitest-environment happy-dom
 */
import type { TextSelection } from '@blocksuite/std';
import { describe, expect, it } from 'vitest';

import { replaceSelectedTextWithBlocksCommand } from '../../../commands/model-crud/replace-selected-text-with-blocks';
import { bridgeflow, block } from '../../../test-utils';

describe('commands/model-crud', () => {
  describe('replaceSelectedTextWithBlocksCommand', () => {
    it('should replace selected text with blocks when both first and last blocks are mergable blocks', () => {
      const host = bridgeflow`
        <bridgeflow-page id="page">
          <bridgeflow-note id="note">
            <bridgeflow-paragraph id="paragraph-1">Hel<anchor />lo</bridgeflow-paragraph>
            <bridgeflow-paragraph id="paragraph-2">Wor<focus />ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const blocks = [
        block`<bridgeflow-paragraph id="111">111</bridgeflow-paragraph>`,
        block`<bridgeflow-code id="code"></bridgeflow-code>`,
        block`<bridgeflow-paragraph id="222">222</bridgeflow-paragraph>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = bridgeflow`
        <bridgeflow-page id="page">
          <bridgeflow-note id="note">
            <bridgeflow-paragraph id="paragraph-1">Hel111</bridgeflow-paragraph>
            <bridgeflow-code id="code"></bridgeflow-code>
            <bridgeflow-paragraph id="paragraph-2">222ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when both first and last blocks are mergable blocks in single paragraph', () => {
      const host = bridgeflow`
        <bridgeflow-page id="page">
          <bridgeflow-note id="note">
            <bridgeflow-paragraph id="paragraph-1">Hel<anchor></anchor>lo Wor<focus></focus>ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const blocks = [
        block`<bridgeflow-paragraph id="111">111</bridgeflow-paragraph>`,
        block`<bridgeflow-code id="code"></bridgeflow-code>`,
        block`<bridgeflow-paragraph id="222">222</bridgeflow-paragraph>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = bridgeflow`
        <bridgeflow-page id="page">
          <bridgeflow-note id="note">
            <bridgeflow-paragraph id="paragraph-1">Hel111</bridgeflow-paragraph>
            <bridgeflow-code id="code"></bridgeflow-code>
            <bridgeflow-paragraph id="222">222ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when blocks contains only one mergable block', () => {
      const host = bridgeflow`
        <bridgeflow-page id="page">
          <bridgeflow-note id="note">
            <bridgeflow-paragraph id="paragraph-1">Hel<anchor />lo</bridgeflow-paragraph>
            <bridgeflow-paragraph id="paragraph-2">Wor<focus />ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const blocks = [block`<bridgeflow-paragraph id="111">111</bridgeflow-paragraph>`]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = bridgeflow`
        <bridgeflow-page id="page">
          <bridgeflow-note id="note">
            <bridgeflow-paragraph id="paragraph-1">Hel111ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when blocks contains only one mergable block in single paragraph', () => {
      const host = bridgeflow`
        <bridgeflow-page id="page">
          <bridgeflow-note id="note">
            <bridgeflow-paragraph id="paragraph-1">Hel<anchor></anchor>lo Wor<focus></focus>ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const blocks = [block`<bridgeflow-paragraph id="111">111</bridgeflow-paragraph>`]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = bridgeflow`
        <bridgeflow-page id="page">
          <bridgeflow-note id="note">
            <bridgeflow-paragraph id="paragraph-1">Hel111ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when only first block is mergable block', () => {
      const host = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note>
            <bridgeflow-paragraph>Hel<anchor />lo</bridgeflow-paragraph>
            <bridgeflow-paragraph>Wor<focus />ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const blocks = [
        block`<bridgeflow-paragraph>111</bridgeflow-paragraph>`,
        block`<bridgeflow-code></bridgeflow-code>`,
        block`<bridgeflow-code></bridgeflow-code>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note >
            <bridgeflow-paragraph>Hel111</bridgeflow-paragraph>
            <bridgeflow-code></bridgeflow-code>
            <bridgeflow-code></bridgeflow-code>
            <bridgeflow-paragraph>ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when only first block is mergable block in single paragraph', () => {
      const host = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note>
            <bridgeflow-paragraph>Hel<anchor></anchor>lo Wor<focus></focus>ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const blocks = [
        block`<bridgeflow-paragraph>111</bridgeflow-paragraph>`,
        block`<bridgeflow-code></bridgeflow-code>`,
        block`<bridgeflow-code></bridgeflow-code>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note>
            <bridgeflow-paragraph>Hel111</bridgeflow-paragraph>
            <bridgeflow-code></bridgeflow-code>
            <bridgeflow-code></bridgeflow-code>
            <bridgeflow-paragraph>ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when only last block is mergable block', () => {
      const host = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note>
            <bridgeflow-paragraph>Hel<anchor />lo</bridgeflow-paragraph>
            <bridgeflow-paragraph>Wor<focus />ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const blocks = [
        block`<bridgeflow-code></bridgeflow-code>`,
        block`<bridgeflow-code></bridgeflow-code>`,
        block`<bridgeflow-paragraph>111</bridgeflow-paragraph>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note >
            <bridgeflow-paragraph>Hel</bridgeflow-paragraph>
            <bridgeflow-code></bridgeflow-code>
            <bridgeflow-code></bridgeflow-code>
            <bridgeflow-paragraph>111ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;
      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when only last block is mergable block in single paragraph', () => {
      const host = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note>
            <bridgeflow-paragraph>Hel<anchor></anchor>lo Wor<focus></focus>ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const blocks = [
        block`<bridgeflow-code></bridgeflow-code>`,
        block`<bridgeflow-code></bridgeflow-code>`,
        block`<bridgeflow-paragraph>111</bridgeflow-paragraph>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note>
            <bridgeflow-paragraph>Hel</bridgeflow-paragraph>
            <bridgeflow-code></bridgeflow-code>
            <bridgeflow-code></bridgeflow-code>
            <bridgeflow-paragraph>111ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;
      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when neither first nor last block is mergable block', () => {
      const host = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note>
            <bridgeflow-paragraph>Hel<anchor />lo</bridgeflow-paragraph>
            <bridgeflow-paragraph>Wor<focus />ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const blocks = [
        block`<bridgeflow-code></bridgeflow-code>`,
        block`<bridgeflow-code></bridgeflow-code>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note >
            <bridgeflow-paragraph>Hel</bridgeflow-paragraph>
            <bridgeflow-code></bridgeflow-code>
            <bridgeflow-code></bridgeflow-code>
            <bridgeflow-paragraph>ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;
      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when neither first nor last block is mergable block in single paragraph', () => {
      const host = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note>
            <bridgeflow-paragraph>Hel<anchor></anchor>lo Wor<focus></focus>ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const blocks = [
        block`<bridgeflow-code></bridgeflow-code>`,
        block`<bridgeflow-code></bridgeflow-code>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note>
            <bridgeflow-paragraph>Hel</bridgeflow-paragraph>
            <bridgeflow-code></bridgeflow-code>
            <bridgeflow-code></bridgeflow-code>
            <bridgeflow-paragraph>ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;
      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when both first and last blocks are mergable blocks with different types', () => {
      const host = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note>
            <bridgeflow-paragraph>Hel<anchor />lo</bridgeflow-paragraph>
            <bridgeflow-paragraph>Wor<focus />ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const blocks = [
        block`<bridgeflow-list>1.</bridgeflow-list>`,
        block`<bridgeflow-list>2.</bridgeflow-list>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note >
            <bridgeflow-paragraph>Hel</bridgeflow-paragraph>
            <bridgeflow-list>1.</bridgeflow-list>
            <bridgeflow-list>2.</bridgeflow-list>
            <bridgeflow-paragraph>ld</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;
      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when both first and last blocks are paragraphs, and cursor is at the end of the text-block with different types', () => {
      const host = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note>
            <bridgeflow-list>Hel<anchor />lo</bridgeflow-list>
            <bridgeflow-list>Wor<focus />ld</bridgeflow-list>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const blocks = [
        block`<bridgeflow-paragraph>111</bridgeflow-paragraph>`,
        block`<bridgeflow-paragraph>222</bridgeflow-paragraph>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note >
            <bridgeflow-list>Hel111</bridgeflow-list>
            <bridgeflow-list>222ld</bridgeflow-list>
          </bridgeflow-note>
        </bridgeflow-page>
      `;
      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when first block is paragraph, and cursor is at the end of the text-block with different type  ', () => {
      const host = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note>
            <bridgeflow-list>Hel<anchor />lo</bridgeflow-list>
            <bridgeflow-list>Wor<focus />ld</bridgeflow-list>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const blocks = [
        block`<bridgeflow-paragraph>111</bridgeflow-paragraph>`,
        block`<bridgeflow-code></bridgeflow-code>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note >
            <bridgeflow-list>Hel111</bridgeflow-list>
            <bridgeflow-code></bridgeflow-code>
            <bridgeflow-list>ld</bridgeflow-list>
          </bridgeflow-note>
        </bridgeflow-page>
      `;
      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when last block is paragraph, and cursor is at the end of the text-block with different type  ', () => {
      const host = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note>
            <bridgeflow-list>Hel<anchor />lo</bridgeflow-list>
            <bridgeflow-list>Wor<focus />ld</bridgeflow-list>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const blocks = [
        block`<bridgeflow-code></bridgeflow-code>`,
        block`<bridgeflow-paragraph>222</bridgeflow-paragraph>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note >
            <bridgeflow-list>Hel</bridgeflow-list>
            <bridgeflow-code></bridgeflow-code>
            <bridgeflow-list>222ld</bridgeflow-list>
          </bridgeflow-note>
        </bridgeflow-page>
      `;
      expect(host.store).toEqualDoc(expected.store);
    });
  });
});
