import type { CSSProperties } from 'react';

export const BRAND_NAME = 'BridgeWS';
export const BRAND_CLOUD_NAME = BRAND_NAME;
export const BRAND_AI_NAME = 'BridgeWS AI';
export const BRAND_CREATOR_NAME = 'Awaiz Ahmed';
export const BRAND_SITE_URL = 'https://awaizahmed.com';
export const BRAND_LOGO_SRC = '/imgs/bridge-logo.webp';

const brandReplacements: [RegExp, string][] = [
  [/AFFiNE Cloud/g, BRAND_CLOUD_NAME],
  [/AFFiNE AI/g, BRAND_AI_NAME],
  [/AFFiNE\.Pro/g, 'awaizahmed.com'],
  [/ai\.affine\.pro/g, 'awaizahmed.com'],
  [/app\.affine\.pro/g, 'awaizahmed.com'],
  [/docs\.affine\.pro/g, 'awaizahmed.com'],
  [/affine\.pro/g, 'awaizahmed.com'],
  [/AFFiNE/g, BRAND_NAME],
];

export function replaceBrandText(value: string) {
  return brandReplacements.reduce((text, [pattern, replacement]) => {
    return text.replace(pattern, replacement);
  }, value);
}

type BrandLogoProps = {
  alt?: string;
  className?: string;
  height?: number | string;
  style?: CSSProperties;
  variant?: 'wordmark' | 'mark';
  width?: number | string;
};

export const BrandLogo = ({
  alt = `${BRAND_NAME} logo`,
  className,
  height,
  style,
  variant = 'wordmark',
  width,
}: BrandLogoProps) => {
  if (variant === 'mark') {
    return (
      <span
        aria-label={alt}
        className={className}
        role="img"
        style={{
          position: 'relative',
          display: 'inline-flex',
          width: width ?? 24,
          height: height ?? 24,
          minWidth: width ?? 24,
          minHeight: height ?? 24,
          overflow: 'hidden',
          borderRadius: 6,
          border: '1px solid rgba(67, 75, 81, 0.16)',
          background:
            'linear-gradient(180deg, rgba(67, 75, 81, 0.98) 0%, rgba(45, 51, 56, 0.98) 100%)',
          boxShadow: '0 1px 2px rgba(17, 20, 24, 0.18)',
          ...style,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '42%',
            height: 4,
            background: '#ff5622',
          }}
        />
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '7px 6px 6px 6px',
            borderTop: '1.5px solid rgba(255, 255, 255, 0.72)',
            borderBottom: '1.5px solid rgba(255, 255, 255, 0.3)',
          }}
        />
      </span>
    );
  }

  return (
    <img
      alt={alt}
      className={className}
      src={BRAND_LOGO_SRC}
      style={{
        display: 'block',
        width: width ?? 'auto',
        height: height ?? 28,
        objectFit: 'contain',
        ...style,
      }}
    />
  );
};
