import { BRAND_NAME, BrandLogo } from '@bridgeflow/component/brand';
import { Button } from '@bridgeflow/admin/components/ui/button';
import { Input } from '@bridgeflow/admin/components/ui/input';
import { Label } from '@bridgeflow/admin/components/ui/label';
import { FeatureType, getUserFeaturesQuery } from '@bridgeflow/graphql';
import type { FormEvent } from 'react';
import { useCallback, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

import { bridgeflowFetch } from '../../fetch-utils';
import { isAdmin, useCurrentUser, useRevalidateCurrentUser } from '../common';

export function Auth() {
  const currentUser = useCurrentUser();
  const revalidate = useRevalidateCurrentUser();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const login = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!emailRef.current || !passwordRef.current) return;
      bridgeflowFetch('/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({
          email: emailRef.current?.value,
          password: passwordRef.current?.value,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(async response => {
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to login');
          }
          return response.json();
        })
        .then(() =>
          bridgeflowFetch('/graphql', {
            method: 'POST',
            body: JSON.stringify({
              operationName: getUserFeaturesQuery.op,
              query: getUserFeaturesQuery.query,
              variables: {},
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          })
        )
        .then(res => res.json())
        .then(
          async ({
            data: {
              currentUser: { features },
            },
          }) => {
            if (features.includes(FeatureType.Admin)) {
              toast.success('Logged in successfully');
              await revalidate();
            } else {
              toast.error('You are not an admin');
            }
          }
        )
        .catch(err => {
          toast.error(`Failed to login: ${err.message}`);
        });
    },
    [revalidate]
  );

  if (currentUser && isAdmin(currentUser)) {
    return <Navigate to="/admin" />;
  }

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] h-dvh">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex justify-center">
              <BrandLogo height={32} />
            </div>
            <h1 className="text-3xl font-bold">{BRAND_NAME} Admin</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to log in to your administrator account.
            </p>
          </div>
          <form onSubmit={login} action="#">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  ref={emailRef}
                  placeholder="m@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  ref={passwordRef}
                  autoComplete="current-password"
                  required
                />
              </div>
              <Button onClick={login} type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex lg:justify-center">
        <div className="relative top-1/4 flex items-center justify-center">
          <BrandLogo height={120} width={320} />
        </div>
      </div>
    </div>
  );
}

export { Auth as Component };
