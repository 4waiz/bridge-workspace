import { FavoriteTag } from '@bridgeflow/core/components/page-list';
import { CompatibleFavoriteItemsAdapter } from '@bridgeflow/core/modules/favorite';
import { toast } from '@bridgeflow/core/utils';
import { useI18n } from '@bridgeflow/i18n';
import { track } from '@bridgeflow/track';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback } from 'react';

export interface FavoriteButtonProps {
  pageId: string;
}

export const useFavorite = (pageId: string) => {
  const t = useI18n();
  const favAdapter = useService(CompatibleFavoriteItemsAdapter);

  const favorite = useLiveData(favAdapter.isFavorite$(pageId, 'doc'));

  const toggleFavorite = useCallback(() => {
    favAdapter.toggle(pageId, 'doc');
    toast(
      favorite
        ? t['com.bridgeflow.toastMessage.removedFavorites']()
        : t['com.bridgeflow.toastMessage.addedFavorites']()
    );
  }, [favorite, pageId, t, favAdapter]);

  return { favorite, toggleFavorite };
};

export const FavoriteButton = ({ pageId }: FavoriteButtonProps) => {
  const { favorite, toggleFavorite } = useFavorite(pageId);

  const handleFavorite = useCallback(() => {
    track.$.header.actions.toggleFavorite();
    toggleFavorite();
  }, [toggleFavorite]);

  return (
    <FavoriteTag
      data-testid="pin-button"
      active={!!favorite}
      onClick={handleFavorite}
    />
  );
};
