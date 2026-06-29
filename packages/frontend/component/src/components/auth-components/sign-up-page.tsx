import type { PasswordLimitsFragment } from '@bridgeflow/graphql';
import { useI18n } from '@bridgeflow/i18n';
import type { FC } from 'react';
import { useCallback, useState } from 'react';

import { Button } from '../../ui/button';
import { notify } from '../../ui/notification';
import { AuthPageContainer } from './auth-page-container';
import { SetPassword } from './set-password';

export const SignUpPage: FC<{
  passwordLimits: PasswordLimitsFragment;
  user: { email?: string };
  onSetPassword: (password: string) => Promise<void>;
  openButtonText?: string;
  onOpenBridgeFlow: () => void;
}> = ({
  passwordLimits,
  user: { email },
  onSetPassword: propsOnSetPassword,
  onOpenBridgeFlow,
  openButtonText,
}) => {
  const t = useI18n();
  const [hasSetUp, setHasSetUp] = useState(false);

  const onSetPassword = useCallback(
    (passWord: string) => {
      propsOnSetPassword(passWord)
        .then(() => setHasSetUp(true))
        .catch(e =>
          notify.error({
            title: t['com.bridgeflow.auth.password.set-failed'](),
            message: String(e),
          })
        );
    },
    [propsOnSetPassword, t]
  );
  const onLater = useCallback(() => {
    setHasSetUp(true);
  }, []);

  return (
    <AuthPageContainer
      title={
        hasSetUp
          ? t['com.bridgeflow.auth.sign.up.success.title']()
          : t['com.bridgeflow.auth.page.sent.email.title']()
      }
      subtitle={
        hasSetUp ? (
          t['com.bridgeflow.auth.sign.up.success.subtitle']()
        ) : (
          <>
            {t['com.bridgeflow.auth.page.sent.email.subtitle']({
              min: String(passwordLimits.minLength),
              max: String(passwordLimits.maxLength),
            })}
            <a href={`mailto:${email}`}>{email}</a>
          </>
        )
      }
    >
      {hasSetUp ? (
        <Button variant="primary" size="large" onClick={onOpenBridgeFlow}>
          {openButtonText ?? t['com.bridgeflow.auth.open.bridgeflow']()}
        </Button>
      ) : (
        <SetPassword
          passwordLimits={passwordLimits}
          onSetPassword={onSetPassword}
          onLater={onLater}
          showLater={true}
        />
      )}
    </AuthPageContainer>
  );
};
