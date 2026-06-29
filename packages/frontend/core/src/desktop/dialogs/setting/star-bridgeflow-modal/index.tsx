import { OverlayModal } from '@bridgeflow/component';
import { useI18n } from '@bridgeflow/i18n';

export const StarBridgeFlowModal = ({
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
          src={'/static/githubStar.mp4'}
          autoPlay
          loop
        />
      }
      title={t['com.bridgeflow.star-bridgeflow.title']()}
      onOpenChange={setOpen}
      description={t['com.bridgeflow.star-bridgeflow.description']()}
      cancelText={t['com.bridgeflow.star-bridgeflow.cancel']()}
      to={BUILD_CONFIG.githubUrl}
      confirmButtonOptions={{
        variant: 'primary',
      }}
      confirmText={t['com.bridgeflow.star-bridgeflow.confirm']()}
      external
    />
  );
};
