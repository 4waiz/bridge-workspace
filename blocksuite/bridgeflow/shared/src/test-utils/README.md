# BridgeFlow Test Tools

## Structured Document Creation

`bridgeflow-template.ts` provides a concise way to create test documents, using a html-like syntax.

### Basic Usage

```typescript
import { bridgeflow } from '@blocksuite/bridgeflow-shared/test-utils';

// Create a simple document
const doc = bridgeflow`
  <bridgeflow-page>
    <bridgeflow-note>
      <bridgeflow-paragraph>Hello, World!</bridgeflow-paragraph>
    </bridgeflow-note>
  </bridgeflow-page>
`;
```

### Complex Structure Example

```typescript
// Create a document with multiple notes and paragraphs
const doc = bridgeflow`
  <bridgeflow-page title="My Test Page">
    <bridgeflow-note>
      <bridgeflow-paragraph>First paragraph</bridgeflow-paragraph>
      <bridgeflow-paragraph>Second paragraph</bridgeflow-paragraph>
    </bridgeflow-note>
    <bridgeflow-note>
      <bridgeflow-paragraph>Another note</bridgeflow-paragraph>
    </bridgeflow-note>
  </bridgeflow-page>
`;
```

### Application in Tests

This tool is particularly suitable for creating documents with specific structures in test cases:

```typescript
import { describe, expect, it } from 'vitest';
import { bridgeflow } from '../__tests__/utils/bridgeflow-template';

describe('My Test', () => {
  it('should correctly handle document structure', () => {
    const doc = bridgeflow`
      <bridgeflow-page>
        <bridgeflow-note>
          <bridgeflow-paragraph>Test content</bridgeflow-paragraph>
        </bridgeflow-note>
      </bridgeflow-page>
    `;

    // Get blocks
    const pages = doc.getBlocksByFlavour('bridgeflow:page');
    const notes = doc.getBlocksByFlavour('bridgeflow:note');
    const paragraphs = doc.getBlocksByFlavour('bridgeflow:paragraph');

    expect(pages.length).toBe(1);
    expect(notes.length).toBe(1);
    expect(paragraphs.length).toBe(1);

    // Perform more tests here...
  });
});
```

### Supported Block Types

Currently supports the following block types:

- `bridgeflow-page` → `bridgeflow:page`
- `bridgeflow-note` → `bridgeflow:note`
- `bridgeflow-paragraph` → `bridgeflow:paragraph`
- `bridgeflow-list` → `bridgeflow:list`
- `bridgeflow-image` → `bridgeflow:image`
