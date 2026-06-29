import { Avatar, IconButton } from '@bridgeflow/component';
import { useEffect, useState } from 'react';

type BridgeUser = {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
} | null;

function readUser(): BridgeUser {
  return ((globalThis as any).__bridgeFlowUser as BridgeUser) ?? null;
}

/**
 * Sidebar account avatar. Clicking it opens the BRIDGE Flow profile panel
 * (Supabase identity). Authentication is handled by the app-level auth gate,
 * so this no longer touches any cloud sign-in flow.
 */
export default function UserInfo() {
  const [user, setUser] = useState<BridgeUser>(readUser());

  useEffect(() => {
    const update = () => setUser(readUser());
    window.addEventListener('bridge-user-changed', update);
    return () => window.removeEventListener('bridge-user-changed', update);
  }, []);

  const label = user?.name || user?.email || 'Account';

  const openProfile = () => {
    window.dispatchEvent(new CustomEvent('bridge-open-profile'));
  };

  return (
    <IconButton
      onClick={openProfile}
      data-testid="sidebar-user-avatar"
      variant="plain"
      size="20"
      style={{ padding: 0 }}
      withoutHover
    >
      <Avatar size={20} name={label} url={user?.avatar} />
    </IconButton>
  );
}
