import { OverlayModal } from '@bridgeflow/component';
import { useEnableCloud } from '@bridgeflow/core/components/hooks/bridgeflow/use-enable-cloud';
import { WorkspaceService } from '@bridgeflow/core/modules/workspace';
import { useI18n } from '@bridgeflow/i18n';
import { useService } from '@kanban-studios/infra';
import { useCallback } from 'react';

import TopSvg from './top-svg';

export const HistoryTipsModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const t = useI18n();
  const currentWorkspace = useService(WorkspaceService).workspace;
  const confirmEnableCloud = useEnableCloud();

  const handleConfirm = useCallback(() => {
    setOpen(false);
    confirmEnableCloud(currentWorkspace);
  }, [confirmEnableCloud, currentWorkspace, setOpen]);

  return (
    <OverlayModal
      open={open}
      topImage={<TopSvg />}
      title={t['com.bridgeflow.history-vision.tips-modal.title']()}
      onOpenChange={setOpen}
      description={t['com.bridgeflow.history-vision.tips-modal.description']()}
      cancelText={t['com.bridgeflow.history-vision.tips-modal.cancel']()}
      confirmButtonOptions={{
        variant: 'primary',
      }}
      onConfirm={handleConfirm}
      confirmText={t['com.bridgeflow.history-vision.tips-modal.confirm']()}
    />
  );
};
