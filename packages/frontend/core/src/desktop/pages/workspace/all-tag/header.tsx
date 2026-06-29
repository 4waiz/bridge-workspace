import { ExplorerNavigation } from '@bridgeflow/core/components/explorer/header/navigation';
import { Header } from '@bridgeflow/core/components/pure/header';

export const AllTagHeader = () => {
  return <Header left={<ExplorerNavigation active={'tags'} />} />;
};
