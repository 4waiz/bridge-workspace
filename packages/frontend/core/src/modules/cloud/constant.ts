import {
  OAuthProviderType,
  ServerDeploymentType,
  ServerFeature,
} from '@bridgeflow/graphql';

import type { ServerConfig, ServerMetadata } from './types';

const LOCAL_ONLY_WEB = BUILD_CONFIG.isWeb && !environment.isSelfHosted;

const LOCAL_SERVER: ServerMetadata & { config: ServerConfig } = {
  id: 'bridgeflow-cloud',
  baseUrl: location.origin,
  config: {
    serverName: 'BRIDGE Flow',
    // The "local" web build has no backend; advertise the app version so the
    // self-host version guard doesn't fall back to '0.0.0' and block creating
    // a purely local workspace.
    version: BUILD_CONFIG.appVersion,
    features: [ServerFeature.LocalWorkspace],
    oauthProviders: [],
    type: ServerDeploymentType.Selfhosted,
    initialized: true,
    credentialsRequirement: {
      password: {
        minLength: 8,
        maxLength: 32,
      },
    },
  },
};

export const BUILD_IN_SERVERS: (ServerMetadata & { config: ServerConfig })[] =
  LOCAL_ONLY_WEB
    ? [LOCAL_SERVER]
    : environment.isSelfHosted
      ? [
          {
            id: 'bridgeflow-cloud',
            baseUrl: location.origin,
            // selfhosted baseUrl is `location.origin`
            // this is ok for web app, but not for desktop app
            // since we never build desktop app in selfhosted mode, so it's fine
            config: {
              serverName: 'BRIDGE Flow Selfhost',
              features: [],
              oauthProviders: [],
              type: ServerDeploymentType.Selfhosted,
              credentialsRequirement: {
                password: {
                  minLength: 8,
                  maxLength: 32,
                },
              },
            },
          },
        ]
      : BUILD_CONFIG.debug
        ? [
            {
              id: 'bridgeflow-cloud',
              baseUrl: BUILD_CONFIG.isElectron
                ? 'http://localhost:8080'
                : location.origin,
              config: {
                serverName: 'BRIDGE Flow',
                features: [
                  ServerFeature.Indexer,
                  ServerFeature.Copilot,
                  ServerFeature.CopilotEmbedding,
                  ServerFeature.OAuth,
                  ServerFeature.Payment,
                  ServerFeature.LocalWorkspace,
                ],
                oauthProviders: [
                  OAuthProviderType.Google,
                  OAuthProviderType.Apple,
                ],
                type: ServerDeploymentType.BridgeFlow,
                credentialsRequirement: {
                  password: {
                    minLength: 8,
                    maxLength: 32,
                  },
                },
              },
            },
          ]
        : BUILD_CONFIG.appBuildType === 'stable'
          ? [
              {
                id: 'bridgeflow-cloud',
                baseUrl: BUILD_CONFIG.isNative
                  ? BUILD_CONFIG.isIOS
                    ? 'https://apple.getbridgeflowapp.com'
                    : 'https://app.bridgeflow.pro'
                  : location.origin,
                config: {
                  serverName: 'BRIDGE Flow',
                  features: [
                    ServerFeature.Indexer,
                    ServerFeature.Copilot,
                    ServerFeature.CopilotEmbedding,
                    ServerFeature.OAuth,
                    ServerFeature.Payment,
                    ServerFeature.LocalWorkspace,
                  ],
                  oauthProviders: [
                    OAuthProviderType.Google,
                    OAuthProviderType.Apple,
                  ],
                  type: ServerDeploymentType.BridgeFlow,
                  credentialsRequirement: {
                    password: {
                      minLength: 8,
                      maxLength: 32,
                    },
                  },
                },
              },
            ]
          : BUILD_CONFIG.appBuildType === 'beta'
            ? [
                {
                  id: 'bridgeflow-cloud',
                  baseUrl: BUILD_CONFIG.isNative
                    ? BUILD_CONFIG.isIOS
                      ? 'https://apple.getbridgeflowapp.com'
                      : 'https://insider.bridgeflow.pro'
                    : location.origin,
                  config: {
                    serverName: 'BRIDGE Flow',
                    features: [
                      ServerFeature.Indexer,
                      ServerFeature.Copilot,
                      ServerFeature.CopilotEmbedding,
                      ServerFeature.OAuth,
                      ServerFeature.Payment,
                      ServerFeature.LocalWorkspace,
                    ],
                    oauthProviders: [
                      OAuthProviderType.Google,
                      OAuthProviderType.Apple,
                    ],
                    type: ServerDeploymentType.BridgeFlow,
                    credentialsRequirement: {
                      password: {
                        minLength: 8,
                        maxLength: 32,
                      },
                    },
                  },
                },
              ]
            : BUILD_CONFIG.appBuildType === 'internal'
              ? [
                  {
                    id: 'bridgeflow-cloud',
                    baseUrl: 'https://insider.bridgeflow.pro',
                    config: {
                      serverName: 'BRIDGE Flow',
                      features: [
                        ServerFeature.Indexer,
                        ServerFeature.Copilot,
                        ServerFeature.CopilotEmbedding,
                        ServerFeature.OAuth,
                        ServerFeature.Payment,
                        ServerFeature.LocalWorkspace,
                      ],
                      oauthProviders: [
                        OAuthProviderType.Google,
                        OAuthProviderType.Apple,
                      ],
                      type: ServerDeploymentType.BridgeFlow,
                      credentialsRequirement: {
                        password: {
                          minLength: 8,
                          maxLength: 32,
                        },
                      },
                    },
                  },
                ]
              : BUILD_CONFIG.appBuildType === 'canary'
                ? [
                    {
                      id: 'bridgeflow-cloud',
                      baseUrl: BUILD_CONFIG.isNative
                        ? 'https://bridgeflow.fail'
                        : location.origin,
                      config: {
                        serverName: 'BRIDGE Flow',
                        features: [
                          ServerFeature.Indexer,
                          ServerFeature.Copilot,
                          ServerFeature.CopilotEmbedding,
                          ServerFeature.OAuth,
                          ServerFeature.Payment,
                          ServerFeature.LocalWorkspace,
                        ],
                        oauthProviders: [
                          OAuthProviderType.Google,
                          OAuthProviderType.Apple,
                        ],
                        type: ServerDeploymentType.BridgeFlow,
                        credentialsRequirement: {
                          password: {
                            minLength: 8,
                            maxLength: 32,
                          },
                        },
                      },
                    },
                  ]
                : [];

export type TelemetryChannel =
  | 'stable'
  | 'beta'
  | 'internal'
  | 'canary'
  | 'local';

const OFFICIAL_TELEMETRY_ENDPOINTS: Record<TelemetryChannel, string> = {
  stable: 'https://app.bridgeflow.pro',
  beta: 'https://insider.bridgeflow.pro',
  internal: 'https://insider.bridgeflow.pro',
  canary: 'https://bridgeflow.fail',
  local: 'http://localhost:8080',
};

export function getOfficialTelemetryEndpoint(
  channel = BUILD_CONFIG.appBuildType
): string {
  if (BUILD_CONFIG.debug) {
    return BUILD_CONFIG.isNative
      ? OFFICIAL_TELEMETRY_ENDPOINTS.local
      : location.origin;
  } else if (['beta', 'internal', 'canary', 'stable'].includes(channel)) {
    return OFFICIAL_TELEMETRY_ENDPOINTS[channel];
  }

  return OFFICIAL_TELEMETRY_ENDPOINTS.stable;
}
