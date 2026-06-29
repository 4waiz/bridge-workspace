import { useI18n } from '@bridgeflow/i18n';
import type { FC } from 'react';

import { Button } from '../../ui/button';
import { AuthPageContainer } from './auth-page-container';

export const SignInSuccessPage: FC<{
  onOpenBridgeFlow: () => void;
}> = ({ onOpenBridgeFlow }) => {
  const t = useI18n();
  return (
    <AuthPageContainer
      title={t['com.bridgeflow.auth.signed.success.title']()}
      subtitle={t['com.bridgeflow.auth.signed.success.subtitle']()}
    >
      <Button variant="primary" size="large" onClick={onOpenBridgeFlow}>
        {t['com.bridgeflow.auth.open.bridgeflow']()}
      </Button>
    </AuthPageContainer>
  );
};
