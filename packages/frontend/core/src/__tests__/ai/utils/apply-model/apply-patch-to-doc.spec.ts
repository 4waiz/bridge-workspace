/**
 * @vitest-environment happy-dom
 */

import { getInternalStoreExtensions } from '@blocksuite/bridgeflow/extensions/store';
import { StoreExtensionManager } from '@blocksuite/bridgeflow-ext-loader';
import { createBridgeFlowTemplate } from '@blocksuite/bridgeflow-shared/test-utils';
import type { Store } from '@blocksuite/store';
import { describe, expect, it } from 'vitest';

import { applyPatchToDoc } from '../../../../blocksuite/ai/utils/apply-model/apply-patch-to-doc';
import type { PatchOp } from '../../../../blocksuite/ai/utils/apply-model/markdown-diff';

declare module 'vitest' {
  interface Assertion<T = any> {
    toEqualDoc(expected: Store, options?: { compareId?: boolean }): T;
  }
}

const manager = new StoreExtensionManager(getInternalStoreExtensions());
const { bridgeflow } = createBridgeFlowTemplate(manager.get('store'));

describe('applyPatchToDoc', () => {
  it('should delete a block', async () => {
    const host = bridgeflow`
    <bridgeflow-page id="page">
      <bridgeflow-note id="note">
        <bridgeflow-paragraph id="paragraph-1">Hello</bridgeflow-paragraph>
        <bridgeflow-paragraph id="paragraph-2">World</bridgeflow-paragraph>
      </bridgeflow-note>
    </bridgeflow-page>
  `;

    const patch: PatchOp[] = [{ op: 'delete', id: 'paragraph-1' }];
    await applyPatchToDoc(host.store, patch);

    const expected = bridgeflow`
      <bridgeflow-page id="page">
        <bridgeflow-note id="note">
          <bridgeflow-paragraph id="paragraph-2">World</bridgeflow-paragraph>
        </bridgeflow-note>
      </bridgeflow-page>
    `;

    expect(host.store).toEqualDoc(expected.store, {
      compareId: true,
    });
  });

  // FIXME: markdown parse error in test mode
  it.skip('should replace a block', async () => {
    const host = bridgeflow`
    <bridgeflow-page id="page">
      <bridgeflow-note id="note">
        <bridgeflow-paragraph id="paragraph-1">Hello</bridgeflow-paragraph>
        <bridgeflow-paragraph id="paragraph-2">World</bridgeflow-paragraph>
      </bridgeflow-note>
    </bridgeflow-page>
  `;

    const patch: PatchOp[] = [
      {
        op: 'replace',
        id: 'paragraph-1',
        content: 'New content',
      },
    ];

    await applyPatchToDoc(host.store, patch);

    const expected = bridgeflow`
      <bridgeflow-page id="page">
        <bridgeflow-note id="note">
          <bridgeflow-paragraph id="paragraph-1">New content</bridgeflow-paragraph>
          <bridgeflow-paragraph id="paragraph-2">World</bridgeflow-paragraph>
        </bridgeflow-note>
      </bridgeflow-page>
    `;

    expect(host.store).toEqualDoc(expected.store, {
      compareId: true,
    });
  });

  // FIXME: markdown parse error in test mode
  it.skip('should insert a block at index', async () => {
    const host = bridgeflow`
    <bridgeflow-page id="page">
      <bridgeflow-note id="note">
        <bridgeflow-paragraph id="paragraph-1">Hello</bridgeflow-paragraph>
        <bridgeflow-paragraph id="paragraph-2">World</bridgeflow-paragraph>
      </bridgeflow-note>
    </bridgeflow-page>
  `;

    const patch: PatchOp[] = [
      {
        op: 'insert',
        index: 2,
        after: 'paragraph-1',
        block: {
          id: 'paragraph-3',
          type: 'bridgeflow:paragraph',
          content: 'Inserted',
        },
      },
    ];

    await applyPatchToDoc(host.store, patch);

    const expected = bridgeflow`
      <bridgeflow-page id="page">
        <bridgeflow-note id="note">
          <bridgeflow-paragraph id="paragraph-1">Hello</bridgeflow-paragraph>
          <bridgeflow-paragraph id="paragraph-2">World</bridgeflow-paragraph>
          <bridgeflow-paragraph id="paragraph-3">Inserted</bridgeflow-paragraph>
        </bridgeflow-note>
      </bridgeflow-page>
    `;

    expect(host.store).toEqualDoc(expected.store, {
      compareId: true,
    });
  });
});
