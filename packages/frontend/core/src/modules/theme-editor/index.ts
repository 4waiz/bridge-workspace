import { type Framework } from '@kanban-studios/infra';

import { GlobalState } from '../storage';
import { ThemeEditorService } from './services/theme-editor';

export { ThemeEditorService };

export function configureThemeEditorModule(framework: Framework) {
  framework.service(ThemeEditorService, [GlobalState]);
}
