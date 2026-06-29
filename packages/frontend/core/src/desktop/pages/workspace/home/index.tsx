import { WorkspaceHome } from '@bridgeflow/core/desktop/components/workspace-home';
import {
  ViewBody,
  ViewHeader,
  ViewIcon,
  ViewTitle,
} from '@bridgeflow/core/modules/workbench';

export const Component = function HomePage() {
  return (
    <>
      <ViewTitle title="Home" />
      <ViewIcon icon="allDocs" />
      <ViewHeader>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 8,
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          Home
        </div>
      </ViewHeader>
      <ViewBody>
        <WorkspaceHome />
      </ViewBody>
    </>
  );
};
