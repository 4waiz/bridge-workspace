import { generateSubscriptionCallbackLink } from '@bridgeflow/core/components/hooks/bridgeflow/use-subscription-notify';
import { AuthService, SubscriptionService } from '@bridgeflow/core/modules/cloud';
import { UrlService } from '@bridgeflow/core/modules/url';
import { SubscriptionPlan, SubscriptionRecurring } from '@bridgeflow/graphql';
import { useFramework } from '@kanban-studios/infra';
import { nanoid } from 'nanoid';
import { useCallback } from 'react';

/**
 * Hook to handle AI subscription checkout
 * @returns A function that initiates the AI subscription checkout process
 */
export const useAISubscribe = () => {
  const framework = useFramework();

  const handleAISubscribe = useCallback(async () => {
    try {
      const authService = framework.get(AuthService);
      const subscriptionService = framework.get(SubscriptionService);
      const urlService = framework.get(UrlService);

      const account = authService.session.account$.value;
      if (!account) {
        return;
      }

      const idempotencyKey = nanoid();
      const checkoutOptions = {
        recurring: SubscriptionRecurring.Yearly,
        plan: SubscriptionPlan.AI,
        variant: null,
        coupon: null,
        successCallbackLink: generateSubscriptionCallbackLink(
          account,
          SubscriptionPlan.AI,
          SubscriptionRecurring.Yearly
        ),
      };

      const session = await subscriptionService.createCheckoutSession({
        idempotencyKey,
        ...checkoutOptions,
      });

      urlService.openExternal(session);
    } catch (error) {
      console.error(error);
    }
  }, [framework]);

  return handleAISubscribe;
};
