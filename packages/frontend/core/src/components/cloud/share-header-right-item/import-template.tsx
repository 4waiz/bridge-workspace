import { Button } from '@bridgeflow/component';
import { useNavigateHelper } from '@bridgeflow/core/components/hooks/use-navigate-helper';
import { useI18n } from '@bridgeflow/i18n';

export const ImportTemplateButton = ({
  name,
  snapshotUrl,
}: {
  name: string;
  snapshotUrl: string;
}) => {
  const t = useI18n();
  const { jumpToImportTemplate } = useNavigateHelper();
  return (
    <Button
      variant="primary"
      onClick={() => jumpToImportTemplate(name, snapshotUrl)}
    >
      {t['com.bridgeflow.share-page.header.import-template']()}
    </Button>
  );
};
