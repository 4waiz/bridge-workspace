import { notify } from '@bridgeflow/component';
import { SignInPageContainer } from '@bridgeflow/component/auth-components';
import { SignInPanel } from '@bridgeflow/core/components/sign-in';
import type { AuthSessionStatus } from '@bridgeflow/core/modules/cloud/entities/session';
import { useI18n } from '@bridgeflow/i18n';
import { useCallback, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import {
  RouteLogic,
  useNavigateHelper,
} from '../../../components/hooks/use-navigate-helper';

export const SignIn = ({
  redirectUrl: redirectUrlFromProps,
}: {
  redirectUrl?: string;
}) => {
  const t = useI18n();
  const navigate = useNavigate();
  const { jumpToIndex } = useNavigateHelper();
  const [searchParams] = useSearchParams();
  const redirectUrl = redirectUrlFromProps ?? searchParams.get('redirect_uri');

  const server = searchParams.get('server') ?? undefined;
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      notify.error({
        title: t['com.bridgeflow.auth.toast.title.failed'](),
        message: error,
      });
    }
  }, [error, t]);

  const handleClose = useCallback(() => {
    jumpToIndex(RouteLogic.REPLACE, {
      search: searchParams.toString(),
    });
  }, [jumpToIndex, searchParams]);

  const handleAuthenticated = useCallback(
    (status: AuthSessionStatus) => {
      if (status === 'authenticated') {
        if (redirectUrl) {
          if (redirectUrl.toUpperCase() === 'CLOSE_POPUP') {
            window.close();
          }
          navigate(redirectUrl, {
            replace: true,
          });
        } else {
          handleClose();
        }
      }
    },
    [handleClose, navigate, redirectUrl]
  );

  const initStep = server ? 'addSelfhosted' : 'signIn';

  return (
    <SignInPageContainer>
      <div style={{ maxWidth: '400px', width: '100%', zIndex: 1 }}>
        <SignInPanel
          onSkip={handleClose}
          onAuthenticated={handleAuthenticated}
          initStep={initStep}
          server={server}
        />
      </div>
    </SignInPageContainer>
  );
};

export const Component = () => {
  // BRIDGE Flow authenticates through its own (Supabase) sign-in gate; the
  // AFFiNE cloud sign-in is disabled. Bounce any navigation to /sign-in back
  // into the app instead of showing the cloud sign-in page.
  return <Navigate to="/" replace />;
};
