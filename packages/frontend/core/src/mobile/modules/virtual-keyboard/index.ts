import type { Framework } from '@kanban-studios/infra';

import { VirtualKeyboardProvider } from './providers/virtual-keyboard';
import { VirtualKeyboardService } from './services/virtual-keyboard';

export { VirtualKeyboardProvider, VirtualKeyboardService };

export function configureMobileVirtualKeyboardModule(framework: Framework) {
  framework.service(VirtualKeyboardService, [VirtualKeyboardProvider]);
}
