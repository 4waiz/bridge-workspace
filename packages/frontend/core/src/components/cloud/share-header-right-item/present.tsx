import { Button } from '@bridgeflow/component/ui/button';
import { EditorService } from '@bridgeflow/core/modules/editor';
import { useI18n } from '@bridgeflow/i18n';
import { PresentationIcon } from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@kanban-studios/infra';

import * as styles from './styles.css';

export const PresentButton = () => {
  const t = useI18n();
  const editorService = useService(EditorService);
  const isPresent = useLiveData(editorService.editor.isPresenting$);

  return (
    <Button
      prefix={<PresentationIcon />}
      className={styles.presentButton}
      onClick={() => editorService.editor.togglePresentation()}
      disabled={isPresent}
    >
      {t['com.bridgeflow.share-page.header.present']()}
    </Button>
  );
};
