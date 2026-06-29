import { Button, type ButtonProps } from '@bridgeflow/component';
import { generateSubscriptionCallbackLink } from '@bridgeflow/core/components/hooks/bridgeflow/use-subscription-notify';
import { AuthService } from '@bridgeflow/core/modules/cloud';
import {
  SubscriptionPlan,
  SubscriptionRecurring,
  SubscriptionVariant,
} from '@bridgeflow/graphql';
import { useI18n } from '@bridgeflow/i18n';
import track from '@bridgeflow/track';
import { useService } from '@toeverything/infra';
import { useCallback, useMemo } from 'react';

import { CheckoutSlot } from '../../checkout-slot';

export const AIRedeemCodeButton = (btnProps: ButtonProps) => {
  const t = useI18n();
  const authService = useService(AuthService);

  const onBeforeCheckout = useCallback(() => {
    track.$.settingsPanel.plans.checkout({
      plan: SubscriptionPlan.AI,
      recurring: SubscriptionRecurring.Yearly,
    });
  }, []);
  const checkoutOptions = useMemo(
    () => ({
      recurring: SubscriptionRecurring.Yearly,
      plan: SubscriptionPlan.AI,
      variant: SubscriptionVariant.Onetime,
      coupon: null,
      successCallbackLink: generateSubscriptionCallbackLink(
        authService.session.account$.value,
        SubscriptionPlan.AI,
        SubscriptionRecurring.Yearly
      ),
    }),
    [authService.session.account$.value]
  );

  return (
    <CheckoutSlot
      onBeforeCheckout={onBeforeCheckout}
      checkoutOptions={checkoutOptions}
      renderer={props => (
        <Button variant="primary" {...btnProps} {...props}>
          {t['com.bridgeflow.payment.redeem-code']()}
        </Button>
      )}
    />
  );
};
