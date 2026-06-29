import { OverlayModal } from '@bridgeflow/component';
import { useI18n } from '@bridgeflow/i18n';

export const IssueFeedbackModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const t = useI18n();

  return (
    <OverlayModal
      open={open}
      topImage={
        <video
          width={400}
          height={300}
          style={{ objectFit: 'cover' }}
          src={'/static/newIssue.mp4'}
          autoPlay
          loop
        />
      }
      title={t['com.bridgeflow.issue-feedback.title']()}
      onOpenChange={setOpen}
      description={t['com.bridgeflow.issue-feedback.description']()}
      cancelText={t['com.bridgeflow.issue-feedback.cancel']()}
      to={`${BUILD_CONFIG.githubUrl}/issues/new/choose`}
      confirmText={t['com.bridgeflow.issue-feedback.confirm']()}
      confirmButtonOptions={{
        variant: 'primary',
      }}
      external
    />
  );
};
