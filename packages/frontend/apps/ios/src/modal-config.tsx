import { ModalConfigContext } from '@bridgeflow/component';
import { NavigationGestureService } from '@bridgeflow/core/mobile/modules/navigation-gesture';
import { globalVars } from '@bridgeflow/core/mobile/styles/variables.css';
import { useService } from '@kanban-studios/infra';
import { useCallback, useMemo } from 'react';

export const ModalConfigProvider = ({ children }: React.PropsWithChildren) => {
  const navigationGesture = useService(NavigationGestureService);

  const onOpen = useCallback(() => {
    const prev = navigationGesture.enabled$.value;
    if (prev) {
      navigationGesture.setEnabled(false);
      return () => {
        navigationGesture.setEnabled(prev);
      };
    }
    return;
  }, [navigationGesture]);
  const modalConfigValue = useMemo(
    () => ({ onOpen, dynamicKeyboardHeight: globalVars.appKeyboardHeight }),
    [onOpen]
  );

  return (
    <ModalConfigContext.Provider value={modalConfigValue}>
      {children}
    </ModalConfigContext.Provider>
  );
};
