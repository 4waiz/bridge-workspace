import { BrandLogo } from '@bridgeflow/component/brand';
import { Navigate } from 'react-router-dom';

import { useServerConfig } from '../common';
import { Form } from './form';

export function Setup() {
  const config = useServerConfig();

  if (config.initialized) {
    return <Navigate to="/admin" />;
  }

  return (
    <div className="w-full lg:grid lg:grid-cols-2 h-dvh">
      <div className="flex items-center justify-center py-12 h-full">
        <Form />
      </div>
      <div className="hidden lg:block relative overflow-hidden ">
        <div className="absolute bottom-20 right-16">
          <BrandLogo height={148} width={380} />
        </div>
      </div>
    </div>
  );
}

export { Setup as Component };
