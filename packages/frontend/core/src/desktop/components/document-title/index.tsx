import { BRAND_NAME } from '@bridgeflow/component/brand';
import { NotificationCountService } from '@bridgeflow/core/modules/notification';
import { useLiveData, useService } from '@kanban-studios/infra';
import { useEffect } from 'react';

export const DocumentTitle = () => {
  const notificationCountService = useService(NotificationCountService);
  const notificationCount = useLiveData(notificationCountService.count$);

  useEffect(() => {
    const prefix = notificationCount > 0 ? `(${notificationCount}) ` : '';
    document.title = prefix + BRAND_NAME;

    return () => {
      document.title = BRAND_NAME;
    };
  }, [notificationCount]);

  return null;
};
