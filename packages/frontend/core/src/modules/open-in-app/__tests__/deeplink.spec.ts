import { expect, test } from 'vitest';

import {
  buildAuthenticationDeepLink,
  buildOpenAppUrlRoute,
  normalizeOpenAppSignInNextParam,
} from '../utils';

test('buildAuthenticationDeepLink', () => {
  const payload = { code: '1', next: '/workspace/123' };
  const url = buildAuthenticationDeepLink({
    scheme: 'bridgeflow',
    method: 'open-app-signin',
    payload,
    server: 'https://app.bridgeflow.local',
  });

  const parsed = new URL(url);

  expect(parsed.protocol).toBe('bridgeflow:');
  expect(parsed.hostname).toBe('authentication');
  expect(parsed.searchParams.get('method')).toBe('open-app-signin');
  expect(parsed.searchParams.get('payload')).toBe(JSON.stringify(payload));
  expect(parsed.searchParams.get('server')).toBe('https://app.bridgeflow.local');
});

test('buildOpenAppUrlRoute', () => {
  const urlToOpen = 'bridgeflow://authentication?method=oauth&payload=%7B%7D';
  const route = buildOpenAppUrlRoute(urlToOpen);

  const parsed = new URL(route, 'https://app.bridgeflow.local');
  expect(parsed.pathname).toBe('/open-app/url');
  expect(parsed.searchParams.get('url')).toBe(urlToOpen);
});

test('normalizeOpenAppSignInNextParam', () => {
  expect(
    normalizeOpenAppSignInNextParam(
      '/workspace/123',
      'https://app.bridgeflow.local'
    )
  ).toBe('/workspace/123');

  expect(
    normalizeOpenAppSignInNextParam(
      'https://app.bridgeflow.local/workspace/123?foo=1#bar',
      'https://app.bridgeflow.local'
    )
  ).toBe('/workspace/123?foo=1#bar');

  expect(
    normalizeOpenAppSignInNextParam(
      'https://evil.example/workspace/123',
      'https://app.bridgeflow.local'
    )
  ).toBeUndefined();

  expect(
    normalizeOpenAppSignInNextParam(
      '//evil.example/workspace/123',
      'https://app.bridgeflow.local'
    )
  ).toBeUndefined();

  expect(
    normalizeOpenAppSignInNextParam(
      '/redirect-proxy?redirect_uri=https://evil.example',
      'https://app.bridgeflow.local'
    )
  ).toBeUndefined();
});
