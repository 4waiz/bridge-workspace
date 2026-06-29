import { Button, Loading } from '@bridgeflow/component';
import {
  SettingHeader,
  SettingRow,
  SettingWrapper,
} from '@bridgeflow/component/setting-components';
import { WorkspaceSubscriptionService } from '@bridgeflow/core/modules/cloud';
import { WorkspaceService } from '@bridgeflow/core/modules/workspace';
import { useI18n } from '@bridgeflow/i18n';
import { useLiveData, useService } from '@kanban-studios/infra';
import { useCallback, useEffect, useState } from 'react';

import { TeamResumeAction } from '../../general-setting/plans/actions';
import { BillingHistory } from './billing-history';
import { PaymentMethodUpdater } from './payment-method';
import { TeamCard } from './team-card';
import { TypeformLink } from './typeform-link';

export const WorkspaceSettingBilling = () => {
  const workspace = useService(WorkspaceService).workspace;

  const t = useI18n();

  const subscriptionService = workspace?.scope.get(
    WorkspaceSubscriptionService
  );
  const subscription = useLiveData(
    subscriptionService?.subscription.subscription$
  );

  useEffect(() => {
    subscriptionService?.subscription.revalidate();
  }, [subscriptionService?.subscription]);

  if (workspace === null) {
    return null;
  }

  if (!subscription) {
    return <Loading />;
  }

  return (
    <>
      <SettingHeader
        title={t['com.bridgeflow.payment.billing-setting.title']()}
        subtitle={t['com.bridgeflow.payment.billing-setting.subtitle']()}
      />
      <SettingWrapper
        title={t['com.bridgeflow.payment.billing-setting.information']()}
      >
        <TeamCard />
        <TypeformLink />
        <PaymentMethodUpdater />
        {subscription?.end && subscription.canceledAt ? (
          <ResumeSubscription expirationDate={subscription.end} />
        ) : null}
      </SettingWrapper>

      <SettingWrapper title={t['com.bridgeflow.payment.billing-setting.history']()}>
        <BillingHistory />
      </SettingWrapper>
    </>
  );
};

const ResumeSubscription = ({ expirationDate }: { expirationDate: string }) => {
  const t = useI18n();
  const [open, setOpen] = useState(false);
  const handleClick = useCallback(() => {
    setOpen(true);
  }, []);

  return (
    <SettingRow
      name={t['com.bridgeflow.payment.billing-setting.expiration-date']()}
      desc={t['com.bridgeflow.payment.billing-setting.expiration-date.description'](
        {
          expirationDate: new Date(expirationDate).toLocaleDateString(),
        }
      )}
    >
      <TeamResumeAction open={open} onOpenChange={setOpen}>
        <Button onClick={handleClick} variant="primary">
          {t['com.bridgeflow.payment.billing-setting.resume-subscription']()}
        </Button>
      </TeamResumeAction>
    </SettingRow>
  );
};
