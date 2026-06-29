import { Service } from '@kanban-studios/infra';

import { FavoriteList } from '../entities/favorite-list';

export class FavoriteService extends Service {
  favoriteList = this.framework.createEntity(FavoriteList);
}
