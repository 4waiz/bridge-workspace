import type { MenuItemProps } from '@bridgeflow/component';
import { MenuItem } from '@bridgeflow/component';
import { useI18n } from '@bridgeflow/i18n';
import { ShareIcon } from '@blocksuite/icons/rc';

export const DisablePublicSharing = (props: MenuItemProps) => {
  const t = useI18n();
  return (
    <MenuItem type="danger" prefixIcon={<ShareIcon />} {...props}>
      {t['Disable Public Sharing']()}
    </MenuItem>
  );
};
