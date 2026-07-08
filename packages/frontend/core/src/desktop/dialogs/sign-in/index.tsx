import type {
  DialogComponentProps,
  GLOBAL_DIALOG_SCHEMA,
} from '@bridgeflow/core/modules/dialogs';
import { useEffect } from 'react';

// BRIDGE Flow authenticates through its own (Supabase) sign-in gate; the AFFiNE
// cloud sign-in is disabled. If anything opens the 'sign-in' dialog, close it
// immediately and render nothing so the cloud sign-in never appears.
export const SignInDialog = ({
  close,
}: DialogComponentProps<GLOBAL_DIALOG_SCHEMA['sign-in']>) => {
  useEffect(() => {
    close();
  }, [close]);
  return null;
};
