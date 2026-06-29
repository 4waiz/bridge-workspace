import { Button, usePromptModal } from '@bridgeflow/component';
import { useI18n } from '@bridgeflow/i18n';
import { SaveIcon } from '@blocksuite/icons/rc';
import { useCallback } from 'react';

import * as styles from './save-as-collection-button.css';

interface SaveAsCollectionButtonProps {
  onConfirm: (collectionName: string) => void;
}

export const SaveAsCollectionButton = ({
  onConfirm,
}: SaveAsCollectionButtonProps) => {
  const t = useI18n();
  const { openPromptModal } = usePromptModal();
  const handleClick = useCallback(() => {
    openPromptModal({
      title: t['com.bridgeflow.editCollection.saveCollection'](),
      label: t['com.bridgeflow.editCollectionName.name'](),
      inputOptions: {
        placeholder: t['com.bridgeflow.editCollectionName.name.placeholder'](),
      },
      children: (
        <div className={styles.createTips}>
          {t['com.bridgeflow.editCollectionName.createTips']()}
        </div>
      ),
      confirmText: t['com.bridgeflow.editCollection.save'](),
      cancelText: t['com.bridgeflow.editCollection.button.cancel'](),
      confirmButtonOptions: {
        variant: 'primary',
      },
      onConfirm(name) {
        onConfirm(name);
      },
    });
  }, [openPromptModal, t, onConfirm]);
  return (
    <Button
      onClick={handleClick}
      data-testid="save-as-collection"
      prefix={<SaveIcon />}
      className={styles.button}
    >
      {t['com.bridgeflow.editCollection.saveCollection']()}
    </Button>
  );
};
