import { Button, notify } from '@bridgeflow/component';
import { SettingRow } from '@bridgeflow/component/setting-components';
import { useAsyncCallback } from '@bridgeflow/core/components/hooks/bridgeflow-async-hooks';
import { useMutation } from '@bridgeflow/core/components/hooks/use-mutation';
import { UrlService } from '@bridgeflow/core/modules/url';
import { UserFriendlyError } from '@bridgeflow/error';
import { createCustomerPortalMutation } from '@bridgeflow/graphql';
import { useI18n } from '@bridgeflow/i18n';
import { useService } from '@toeverything/infra';

import * as styles from './styles.css';

export const PaymentMethodUpdater = () => {
  const { isMutating, trigger } = useMutation({
    mutation: createCustomerPortalMutation,
  });
  const urlService = useService(UrlService);
  const t = useI18n();

  const update = useAsyncCallback(async () => {
    await trigger(null, {
      onSuccess: data => {
        urlService.openExternal(data.createCustomerPortal);
      },
    }).catch(e => {
      const userFriendlyError = UserFriendlyError.fromAny(e);
      notify.error(userFriendlyError);
    });
  }, [trigger, urlService]);

  return (
    <SettingRow
      className={styles.paymentMethod}
      name={t['com.bridgeflow.payment.billing-setting.payment-method']()}
      desc={t[
        'com.bridgeflow.payment.billing-setting.payment-method.description'
      ]()}
    >
      <Button onClick={update} loading={isMutating} disabled={isMutating}>
        {t['com.bridgeflow.payment.billing-setting.payment-method.go']()}
      </Button>
    </SettingRow>
  );
};
