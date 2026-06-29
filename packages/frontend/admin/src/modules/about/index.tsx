import { ScrollArea } from '@bridgeflow/admin/components/ui/scroll-area';

import { Header } from '../header';
import { AboutBridgeFlow } from './about';

export function ConfigPage() {
  return (
    <div className="h-dvh flex-1 space-y-1 flex-col flex">
      <Header title="Server" />
      <ScrollArea>
        <AboutBridgeFlow />
      </ScrollArea>
    </div>
  );
}

export { ConfigPage as Component };
