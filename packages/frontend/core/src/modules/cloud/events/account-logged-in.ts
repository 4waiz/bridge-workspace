import { createEvent } from '@kanban-studios/infra';

import type { AuthAccountInfo } from '../entities/session';

export const AccountLoggedIn = createEvent<AuthAccountInfo>('AccountLoggedIn');
