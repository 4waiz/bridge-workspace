import '@bridgeflow/core/bootstrap/electron';
import '@bridgeflow/core/bootstrap/cleanup';
import '@bridgeflow/component/theme';
import './global.css';

import { apis } from '@bridgeflow/electron-api';
import { bindNativeDBApis } from '@bridgeflow/nbstore/sqlite';
import { bindNativeDBV1Apis } from '@bridgeflow/nbstore/sqlite/v1';

// oxlint-disable-next-line no-non-null-assertion
bindNativeDBApis(apis!.nbstore);
// oxlint-disable-next-line no-non-null-assertion
bindNativeDBV1Apis(apis!.db);
