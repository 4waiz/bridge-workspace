import { Button } from '@bridgeflow/component';
import { useI18n } from '@bridgeflow/i18n';

import * as styles from './collection-list-header.css';

export const CollectionListHeader = ({
  onCreate,
}: {
  onCreate: () => void;
}) => {
  const t = useI18n();

  return (
    <div className={styles.collectionListHeader}>
      <div className={styles.collectionListHeaderTitle}>
        {t['com.bridgeflow.collections.header']()}
      </div>
      <Button
        className={styles.newCollectionButton}
        onClick={onCreate}
        data-testid="all-collection-new-button"
      >
        {t['com.bridgeflow.collections.empty.new-collection-button']()}
      </Button>
    </div>
  );
};
