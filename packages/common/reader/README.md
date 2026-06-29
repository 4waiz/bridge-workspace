# BridgeFlow Blocksuite format YDoc reader

## Usage

### read rootYDoc

```ts
import { readAllDocsFromRootDoc } from '@bridgeflow/reader';

const docs = readAllDocsFromRootDoc(rootDoc);
console.log(Array.from(docsWithTrash.entries()));

// [
//   'doc-id-1', { title: 'test doc title' },
//   // ...
// ]
```

### read YDoc

```ts
import { readAllBlocksFromDoc } from '@bridgeflow/reader';

const blocks = readAllBlocksFromDoc(doc);
```
