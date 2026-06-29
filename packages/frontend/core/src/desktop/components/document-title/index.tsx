import { BRAND_NAME } from '@bridgeflow/component/brand';
import { NotificationCountService } from '@bridgeflow/core/modules/notification';
import { WorkbenchService } from '@bridgeflow/core/modules/workbench';
import { useLiveData, useService } from '@kanban-studios/infra';
import { useEffect } from 'react';

export const DocumentTitle = () => {
  const notificationCountService = useService(NotificationCountService);
  const notificationCount = useLiveData(notificationCountService.count$);
  const workbenchService = useService(WorkbenchService);
  const workbenchView = useLiveData(workbenchService.workbench.activeView$);
  const viewTitle = useLiveData(workbenchView.title$);

  useEffect(() => {
    const prefix = notificationCount > 0 ? `(${notificationCount}) ` : '';
    document.title =
      prefix + (viewTitle ? `${viewTitle} - ${BRAND_NAME}` : BRAND_NAME);

    return () => {
      document.title = BRAND_NAME;
    };
  }, [notificationCount, viewTitle]);

  return null;
};
