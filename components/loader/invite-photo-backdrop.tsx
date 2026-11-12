'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';
import {
  LOADING_BG_PHOTOS,
  MOBILE_BACKGROUND_PHOTOS,
} from '@/lib/loading-bg-photos';
import './loading-screen.css';

export { LOADING_BG_PHOTOS };

export const MOBILE_BG_PHOTOS = MOBILE_BACKGROUND_PHOTOS;

const MARQUEE_SAMPLE_SIZE = 24;

function pickRandomPhotos(photos: readonly string[], count: number) {
  const next = [...photos];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next.slice(0, Math.min(count, next.length));
}

function splitMarqueeRows(photos: readonly string[]) {
  const top: string[] = [];
  const bottom: string[] = [];
  photos.forEach((src, index) => {
    (index % 2 === 0 ? top : bottom).push(src);
  });
  return [top, bottom] as const;
}

type ImageOptions = {
  /** next/image `sizes` for each tile */
  sizes?: string;
  /** next/image quality (1–100) */
  quality?: number;
  /** Tiles per row loaded with priority (default: all for short lists, else 3) */
  eagerCount?: number;
};

const DEFAULT_SIZES = '(min-width: 768px) 38vw, 82vw';

function MarqueeRow({
  photos,
  copies,
  direction,
  eagerCount,
  sizes = DEFAULT_SIZES,
  quality = 55,
}: {
  photos: readonly string[];
  copies: number;
  direction: 'left' | 'right';
  eagerCount: number;
  sizes?: string;
  quality?: number;
}) {
  return (
    <div className={`loading-screen__marquee-row loading-screen__marquee-row--${direction}`}>
      <div className="loading-screen__slide-track">
        {Array.from({ length: copies }, (_, copy) => (
          <div key={copy} className="loading-screen__slide-strip">
            {photos.map((src, index) => {
              const eager = copy === 0 && index < eagerCount;
              return (
                <div key={`${copy}-${src}`} className="loading-screen__slide-photo">
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes={sizes}
                    quality={quality}
                    priority={eager}
                    draggable={false}
                    decoding="async"
                    fetchPriority={copy === 0 && index < 2 ? 'high' : 'low'}
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PhotoMarquee({
  photos,
  copies,
  variant,
  shuffle = true,
  imageOptions,
}: {
  photos: readonly string[];
  copies: number;
  variant: 'mobile' | 'desktop' | 'loader';
  shuffle?: boolean;
  imageOptions?: ImageOptions;
}) {
  const compact = !shuffle || photos.length <= 5;
  const [selected, setSelected] = useState(() =>
    compact ? [...photos] : photos.slice(0, MARQUEE_SAMPLE_SIZE),
  );

  // Reshuffle only when the photo list's contents change — a new array with the same
  // photos (e.g. the remote site config arriving) must not swap the marquee mid-scroll
  const photosKey = photos.join('\n');
  useEffect(() => {
    const list = photosKey ? photosKey.split('\n') : [];
    if (compact) {
      setSelected(list);
      return;
    }
    setSelected(pickRandomPhotos(list, MARQUEE_SAMPLE_SIZE));
  }, [photosKey, compact]);

  const [top, bottom] = compact
    ? [selected, [...selected].reverse()]
    : splitMarqueeRows(selected);
  const eagerCount = imageOptions?.eagerCount ?? (compact ? selected.length : 3);
  const rowProps = { copies, eagerCount, sizes: imageOptions?.sizes, quality: imageOptions?.quality };

  return (
    <div className={`loading-screen__marquee loading-screen__marquee--${variant}`}>
      <MarqueeRow photos={top} direction="left" {...rowProps} />
      <MarqueeRow photos={bottom} direction="right" {...rowProps} />
    </div>
  );
}

/** Fixed photo marquee + veil — continuity from loading screen (photos display only). */
export const InvitePhotoBackdrop = React.memo(function InvitePhotoBackdrop({
  className = '',
  photos,
  imageOptions,
}: {
  className?: string;
  photos?: readonly string[];
  /** Smaller / fewer priority images, e.g. for a blurred backdrop */
  imageOptions?: ImageOptions;
}) {
  const reduceMotion = useHydratedReducedMotion();
  const copies = reduceMotion ? 1 : 2;
  const resolved =
    photos && photos.length > 0
      ? photos
      : LOADING_BG_PHOTOS.length > 0
        ? LOADING_BG_PHOTOS
        : MOBILE_BG_PHOTOS;

  if (resolved.length === 0) return null;

  return (
    <div className={`invite-photo-backdrop ${className}`.trim()} aria-hidden="true">
      <PhotoMarquee photos={resolved} copies={copies} variant="mobile" imageOptions={imageOptions} />
      <div className="loading-screen__backdrop-veil" />
    </div>
  );
});
