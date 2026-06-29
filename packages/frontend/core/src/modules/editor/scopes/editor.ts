import { Scope } from '@kanban-studios/infra';

import type { Editor } from '../entities/editor';

export class EditorScope extends Scope<{
  editor: Editor;
}> {}
