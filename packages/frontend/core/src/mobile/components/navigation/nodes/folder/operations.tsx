import { MenuItem } from '@bridgeflow/component';
import { IsFavoriteIcon } from '@bridgeflow/core/components/pure/icons';
import { CompatibleFavoriteItemsAdapter } from '@bridgeflow/core/modules/favorite';
import { useI18n } from '@bridgeflow/i18n';
import { useLiveData, useService } from '@kanban-studios/infra';
import { useMemo } from 'react';

export const FavoriteFolderOperation = ({ id }: { id: string }) => {
  const t = useI18n();
  const compatibleFavoriteItemsAdapter = useService(
    CompatibleFavoriteItemsAdapter
  );

  const favorite = useLiveData(
    useMemo(() => {
      return compatibleFavoriteItemsAdapter.isFavorite$(id, 'folder');
    }, [compatibleFavoriteItemsAdapter, id])
  );

  return (
    <MenuItem
      prefixIcon={<IsFavoriteIcon favorite={favorite} />}
      onClick={() => compatibleFavoriteItemsAdapter.toggle(id, 'folder')}
    >
      {favorite
        ? t['com.bridgeflow.rootAppSidebar.organize.folder-rm-favorite']()
        : t['com.bridgeflow.rootAppSidebar.organize.folder-add-favorite']()}
    </MenuItem>
  );
};
