import { Button, type ButtonProps } from '@bridgeflow/component';
import { GlobalDialogService } from '@bridgeflow/core/modules/dialogs';
import { useI18n } from '@bridgeflow/i18n';
import { useService } from '@kanban-studios/infra';
import { useCallback } from 'react';

export const AILogin = (btnProps: ButtonProps) => {
  const t = useI18n();
  const globalDialogService = useService(GlobalDialogService);

  const onClickSignIn = useCallback(() => {
    globalDialogService.open('sign-in', {});
  }, [globalDialogService]);

  return (
    <Button onClick={onClickSignIn} variant="primary" {...btnProps}>
      {t['com.bridgeflow.payment.ai.action.login.button-label']()}
    </Button>
  );
};
