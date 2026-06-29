import { useI18n } from '@bridgeflow/i18n';

import { Button } from '../../ui/button';
import { AuthPageContainer } from '../auth-components';

export const ExpiredPage = ({ onOpenBridgeFlow }: { onOpenBridgeFlow: () => void }) => {
  const t = useI18n();
  return (
    <AuthPageContainer
      title={t['com.bridgeflow.expired.page.title']()}
      subtitle={t['com.bridgeflow.expired.page.new-subtitle']()}
    >
      <Button variant="primary" size="large" onClick={onOpenBridgeFlow}>
        {t['com.bridgeflow.auth.open.bridgeflow']()}
      </Button>
    </AuthPageContainer>
  );
};
