import type { ConfirmModalProps, MenuItemProps } from '@bridgeflow/component';
import { ConfirmModal, MenuItem } from '@bridgeflow/component';
import { useI18n } from '@bridgeflow/i18n';
import { DeleteIcon } from '@blocksuite/icons/rc';

export const MoveToTrash = (props: MenuItemProps) => {
  const t = useI18n();

  return (
    <MenuItem prefixIcon={<DeleteIcon />} type="danger" {...props}>
      {t['com.bridgeflow.moveToTrash.title']()}
    </MenuItem>
  );
};

const MoveToTrashConfirm = ({
  titles,
  ...confirmModalProps
}: {
  titles: string[];
} & ConfirmModalProps) => {
  const t = useI18n();
  const multiple = titles.length > 1;
  const title = multiple
    ? t['com.bridgeflow.moveToTrash.confirmModal.title.multiple']({
        number: titles.length.toString(),
      })
    : t['com.bridgeflow.moveToTrash.confirmModal.title']();
  const description = multiple
    ? t['com.bridgeflow.moveToTrash.confirmModal.description.multiple']({
        number: titles.length.toString(),
      })
    : t['com.bridgeflow.moveToTrash.confirmModal.description']({
        title: titles[0] || t['Untitled'](),
      });
  return (
    <ConfirmModal
      title={title}
      description={description}
      cancelText={t['com.bridgeflow.confirmModal.button.cancel']()}
      confirmText={t.Delete()}
      confirmButtonOptions={{
        ['data-testid' as string]: 'confirm-delete-page',
        variant: 'error',
      }}
      {...confirmModalProps}
    />
  );
};

MoveToTrash.ConfirmModal = MoveToTrashConfirm;
