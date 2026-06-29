import { Button } from '@bridgeflow/component';
import { AuthPageContainer } from '@bridgeflow/component/auth-components';
import { useNavigateHelper } from '@bridgeflow/core/components/hooks/use-navigate-helper';
import { GraphQLService } from '@bridgeflow/core/modules/cloud';
import { UserFriendlyError } from '@bridgeflow/error';
import { verifyEmailMutation } from '@bridgeflow/graphql';
import { useI18n } from '@bridgeflow/i18n';
import { useService } from '@kanban-studios/infra';
import { type FC, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { AppContainer } from '../../components/app-container';

export const ConfirmVerifiedEmail: FC<{
  onOpenBridgeFlow: () => void;
}> = ({ onOpenBridgeFlow }) => {
  const t = useI18n();
  const graphqlService = useService(GraphQLService);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigateHelper = useNavigateHelper();

  useEffect(() => {
    (async () => {
      const token = searchParams.get('token') ?? '';
      setIsLoading(true);
      await graphqlService
        .gql({
          query: verifyEmailMutation,
          variables: {
            token: token,
          },
        })
        .catch(error => {
          const userFriendlyError = UserFriendlyError.fromAny(error);
          if (userFriendlyError.is('INVALID_EMAIL_TOKEN')) {
            return navigateHelper.jumpToExpired();
          }
          throw error;
        });
    })().catch(err => {
      // TODO(@eyhn): Add error handling
      console.error(err);
    });
  }, [graphqlService, navigateHelper, searchParams]);

  if (isLoading) {
    return <AppContainer fallback />;
  }

  return (
    <AuthPageContainer
      title={t['com.bridgeflow.auth.change.email.page.success.title']()}
      subtitle={t['com.bridgeflow.auth.change.email.page.success.subtitle']()}
    >
      <Button variant="primary" size="large" onClick={onOpenBridgeFlow}>
        {t['com.bridgeflow.auth.open.bridgeflow']()}
      </Button>
    </AuthPageContainer>
  );
};
