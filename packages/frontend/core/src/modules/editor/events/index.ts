import { createEvent } from '@kanban-studios/infra';

import type { Editor } from '../entities/editor';

export const EditorInitialized = createEvent<Editor>('EditorInitialized');
