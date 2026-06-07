"use client";

import { useEffect, type ReactNode, type RefObject } from "react";
import type { MediaLocation } from "@/lib/airtable/types";
import { resolveFocusMediaByTitle } from "@/lib/collections/resolve-focus-media";
import { useCollectionMap } from "@/components/collections/collection-map-context";

interface CollectionArticleScrollProps {
  children: ReactNode;
  scrollRef: RefObject<HTMLDivElement | null>;
  locations: MediaLocation[];
}

export function CollectionArticleScroll({
  children,
  scrollRef,
  locations,
}: CollectionArticleScrollProps) {
  const { focusOnMedia, clearFocus } = useCollectionMap();

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const markers = Array.from(
      root.querySelectorAll<HTMLElement>("[data-map-focus-title]")
    );
    if (markers.length === 0) return;

    const visible = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target, entry.intersectionRatio);
          } else {
            visible.delete(entry.target);
          }
        }

        if (visible.size === 0) {
          clearFocus();
          return;
        }

        let best: HTMLElement | null = null;
        let bestRatio = -1;
        for (const [el, ratio] of visible) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = el as HTMLElement;
          }
        }

        const title = best?.dataset.mapFocusTitle;
        if (!title) return;

        const media = resolveFocusMediaByTitle(title, locations);
        if (media) focusOnMedia(media);
      },
      { root, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    for (const marker of markers) observer.observe(marker);
    return () => observer.disconnect();
  }, [children, scrollRef, locations, focusOnMedia, clearFocus]);

  return <>{children}</>;
}
