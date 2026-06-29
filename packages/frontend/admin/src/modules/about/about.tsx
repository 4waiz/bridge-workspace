import {
  BRAND_CREATOR_NAME,
  BRAND_NAME,
  BRAND_SITE_URL,
} from '@bridgeflow/component/brand';
import { buttonVariants } from '@bridgeflow/admin/components/ui/button';
import { Separator } from '@bridgeflow/admin/components/ui/separator';
import { cn } from '@bridgeflow/admin/utils';
import { AlbumIcon, ChevronRightIcon, MailWarningIcon } from 'lucide-react';

type Channel = 'stable' | 'canary' | 'beta' | 'internal';

const appNames = {
  stable: BRAND_NAME,
  canary: `${BRAND_NAME} Canary`,
  beta: `${BRAND_NAME} Beta`,
  internal: `${BRAND_NAME} Internal`,
} satisfies Record<Channel, string>;
const appName = appNames[BUILD_CONFIG.appBuildType];

const links = [
  {
    href: BRAND_SITE_URL,
    icon: <AlbumIcon size={20} />,
    label: `Visit ${BRAND_NAME}`,
  },
  {
    href: BRAND_SITE_URL,
    icon: <MailWarningIcon size={20} />,
    label: `Created by ${BRAND_CREATOR_NAME}`,
  },
];

export function AboutBridgeFlow() {
  return (
    <div className="flex flex-col h-full gap-3 py-5 px-6 w-full">
      <div className="flex items-center">
        <span className="text-xl font-semibold">{`About ${BRAND_NAME}`}</span>
      </div>
      <div className="overflow-y-auto space-y-[10px]">
        <div className="flex flex-col rounded-md border">
          {links.map(({ href, icon, label }, index) => (
            <div key={label + index}>
              <a
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'justify-between cursor-pointer w-full'
                )}
                href={href}
                target="_blank"
                rel="noreferrer"
              >
                <div className="flex items-center gap-3">
                  {icon}
                  <span>{label}</span>
                </div>
                <div>
                  <ChevronRightIcon size={20} />
                </div>
              </a>
              {index < links.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 text-sm font-normal text-muted-foreground">
        <div>{`App Version: ${appName} ${BUILD_CONFIG.appVersion}`}</div>
        <div>{`Editor Version: ${BUILD_CONFIG.editorVersion}`}</div>
      </div>
    </div>
  );
}
