import { Button } from '@bridgeflow/component';
import { SettingRow } from '@bridgeflow/component/setting-components';
import { getUpgradeQuestionnaireLink } from '@bridgeflow/core/components/hooks/bridgeflow/use-subscription-notify';
import {
  AuthService,
  WorkspaceSubscriptionService,
} from '@bridgeflow/core/modules/cloud';
import { SubscriptionPlan, SubscriptionRecurring } from '@bridgeflow/graphql';
import { useI18n } from '@bridgeflow/i18n';
import { useLiveData, useService } from '@kanban-studios/infra';

import * as styles from './styles.css';

export const TypeformLink = () => {
  const t = useI18n();
  const workspaceSubscriptionService = useService(WorkspaceSubscriptionService);
  const authService = useService(AuthService);

  const workspaceSubscription = useLiveData(
    workspaceSubscriptionService.subscription.subscription$
  );
  const account = useLiveData(authService.session.account$);

  if (!account) return null;

  const link = getUpgradeQuestionnaireLink({
    name: account.info?.name,
    id: account.id,
    email: account.email,
    recurring: workspaceSubscription?.recurring ?? SubscriptionRecurring.Yearly,
    plan: SubscriptionPlan.Team,
  });

  return (
    <SettingRow
      className={styles.paymentMethod}
      name={t['com.bridgeflow.payment.billing-type-form.title']()}
      desc={t['com.bridgeflow.payment.billing-type-form.description']()}
    >
      <a target="_blank" href={link} rel="noreferrer">
        <Button>{t['com.bridgeflow.payment.billing-type-form.go']()}</Button>
      </a>
    </SettingRow>
  );
};
