"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { MediaLocation } from "@/lib/airtable/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCollectionMap } from "@/components/collections/collection-map-context";
import Link from "next/link";

const HEADLINE_CLASS = "font-medium text-sm leading-snug";
const PANEL_EST_WIDTH = 288;
const PANEL_EST_HEIGHT = 160;
const PIN_BUFFER = 20;
const EDGE_PADDING = 12;
const PIN_RADIUS = 12;
const PANEL_GAP = 16;
const PIN_EDGE_OFFSET = PIN_RADIUS + PANEL_GAP;

function buildPlace(media: MediaLocation): string {
  return [media.city, media.region, media.country].filter(Boolean).join(", ");
}

function locationLine(media: MediaLocation): string {
  if (media.location_name?.trim()) return media.location_name.trim();

  const fromFields = buildPlace(media);
  if (fromFields) return fromFields;

  if (media.natural_feature_name?.trim()) return media.natural_feature_name.trim();

  // e.g. "The Blue Lagoon (Nanuya Levu, Fiji)" → "Nanuya Levu, Fiji"
  const inParens = media.name?.match(/\(([^)]+)\)/);
  if (inParens?.[1]) return inParens[1].trim();

  return "";
}

interface MediaEntryPanelProps {
  media: MediaLocation;
}

function MediaEntryPanel({ media }: MediaEntryPanelProps) {
  const place = locationLine(media);
  const filmTitle = media.media?.name;
  const year = media.media?.release_year;
  const director = media.media?.director;

  return (
    <div className="space-y-2">
      {place && <p className={HEADLINE_CLASS}>{place}</p>}
      {media.media?.media_type && (
        <Badge variant="secondary" className="capitalize text-xs w-fit">
          {media.media.media_type}
        </Badge>
      )}
      {filmTitle && (
        <p className={HEADLINE_CLASS}>
          {filmTitle}
          {year ? ` (${year})` : ""}
        </p>
      )}
    {director && (
        <p className="text-xs text-muted-foreground">Created by {director}</p>
      )}
      <Link
        href={`/?mediaPointId=${media.id}`}
        className="inline-block text-xs font-medium text-primary hover:underline pt-1"
      >
        More details on map view
      </Link>
    </div>
  );
}

type PanelPlacement = {
  left: number;
  top: number;
  transform: string;
};

function panelRect(
  pinX: number,
  pinY: number,
  side: "left" | "right" | "above" | "below"
): { left: number; top: number; right: number; bottom: number } {
  const w = PANEL_EST_WIDTH;
  const h = PANEL_EST_HEIGHT;

  if (side === "left") {
    const right = pinX - PIN_EDGE_OFFSET;
    return { left: right - w, top: pinY - h / 2, right, bottom: pinY + h / 2 };
  }
  if (side === "right") {
    const left = pinX + PIN_EDGE_OFFSET;
    return { left, top: pinY - h / 2, right: left + w, bottom: pinY + h / 2 };
  }
  if (side === "above") {
    const bottom = pinY - PIN_EDGE_OFFSET;
    return { left: pinX - w / 2, top: bottom - h, right: pinX + w / 2, bottom };
  }
  const top = pinY + PIN_EDGE_OFFSET;
  return { left: pinX - w / 2, top, right: pinX + w / 2, bottom: top + h };
}

function pinNearRect(
  px: number,
  py: number,
  rect: { left: number; top: number; right: number; bottom: number }
): boolean {
  const dx = px < rect.left ? rect.left - px : px > rect.right ? px - rect.right : 0;
  const dy = py < rect.top ? rect.top - py : py > rect.bottom ? py - rect.bottom : 0;
  const dist = Math.hypot(dx, dy);
  return dist < PIN_BUFFER;
}

function isFullyInside(
  rect: { left: number; top: number; right: number; bottom: number },
  mapW: number,
  mapH: number
): boolean {
  return (
    rect.left >= EDGE_PADDING &&
    rect.top >= EDGE_PADDING &&
    rect.right <= mapW - EDGE_PADDING &&
    rect.bottom <= mapH - EDGE_PADDING
  );
}

function scorePlacement(
  rect: { left: number; top: number; right: number; bottom: number },
  mapW: number,
  mapH: number,
  otherPins: { x: number; y: number }[],
  side: "left" | "right" | "above" | "below",
  pinX: number
): number {
  let score = 0;

  if (rect.left < EDGE_PADDING) score -= 5000;
  if (rect.top < EDGE_PADDING) score -= 2000;
  if (rect.right > mapW - EDGE_PADDING) score -= 5000;
  if (rect.bottom > mapH - EDGE_PADDING) score -= 2000;

  // Pin near drawer (left side of map) → prefer panel on the right
  if (pinX < mapW * 0.45) {
    if (side === "right") score += 800;
    if (side === "left") score -= 800;
  }

  for (const pin of otherPins) {
    if (pinNearRect(pin.x, pin.y, rect)) score -= 1000;
  }

  return score;
}

function choosePlacement(
  focusedPin: { x: number; y: number },
  otherPins: { x: number; y: number }[],
  mapW: number,
  mapH: number
): PanelPlacement {
  const sides: Array<"left" | "right" | "above" | "below"> = [
    "right",
    "below",
    "above",
    "left",
  ];

  const transforms: Record<string, string> = {
    left: "translate(-100%, -50%)",
    right: "translate(0, -50%)",
    above: "translate(-50%, -100%)",
    below: "translate(-50%, 0)",
  };

  let best: PanelPlacement | null = null;
  let bestScore = -Infinity;

  for (const side of sides) {
    const rect = panelRect(focusedPin.x, focusedPin.y, side);
    if (!isFullyInside(rect, mapW, mapH)) continue;

    const score = scorePlacement(
      rect,
      mapW,
      mapH,
      otherPins,
      side,
      focusedPin.x
    );
    if (score > bestScore) {
      bestScore = score;
      best = {
        left:
          side === "left"
            ? focusedPin.x - PIN_EDGE_OFFSET
            : side === "right"
              ? focusedPin.x + PIN_EDGE_OFFSET
              : focusedPin.x,
        top:
          side === "above"
            ? focusedPin.y - PIN_EDGE_OFFSET
            : side === "below"
              ? focusedPin.y + PIN_EDGE_OFFSET
              : focusedPin.y,
        transform: transforms[side],
      };
    }
  }

  // Fallback: right of pin, vertically centered
  if (best) return best;

  const anchorX = Math.min(
    focusedPin.x + PIN_EDGE_OFFSET,
    mapW - PANEL_EST_WIDTH - EDGE_PADDING
  );

  return {
    left: Math.max(EDGE_PADDING + PANEL_EST_WIDTH, anchorX),
    top: Math.max(
      EDGE_PADDING + PANEL_EST_HEIGHT / 2,
      Math.min(focusedPin.y, mapH - EDGE_PADDING - PANEL_EST_HEIGHT / 2)
    ),
    transform: "translate(0, -50%)",
  };
}

export function MapFocusPanel() {
  const { focusedMedia, collectionLocations, map, clearFocus } =
    useCollectionMap();
  const [placement, setPlacement] = useState<PanelPlacement | null>(null);
    const placementCacheRef = useRef<{
    id: string;
    placement: PanelPlacement;
  } | null>(null);

  useEffect(() => {
    if (!map || !focusedMedia) {
      placementCacheRef.current = null;
      setPlacement(null);
      return;
    }

    if (placementCacheRef.current?.id === focusedMedia.id) {
      setPlacement(placementCacheRef.current.placement);
      return;
    }

    setPlacement(null);

    function computePlacement(): PanelPlacement {
      const container = map!.getContainer();
      const mapW = container.clientWidth;
      const mapH = container.clientHeight;

      const focusedPin = map!.project([
        focusedMedia!.longitude,
        focusedMedia!.latitude,
      ]);

      const otherPins = collectionLocations
        .filter((loc) => loc.id !== focusedMedia!.id)
        .map((loc) => {
          const p = map!.project([loc.longitude, loc.latitude]);
          return { x: p.x, y: p.y };
        });

      return choosePlacement(
        { x: focusedPin.x, y: focusedPin.y },
        otherPins,
        mapW,
        mapH
      );
    }

    function lockPlacement() {
      if (placementCacheRef.current?.id === focusedMedia!.id) return;
      const next = computePlacement();
      placementCacheRef.current = { id: focusedMedia!.id, placement: next };
      setPlacement(next);
    }

    function pinOnScreen(): boolean {
      const container = map!.getContainer();
      const p = map!.project([
        focusedMedia!.longitude,
        focusedMedia!.latitude,
      ]);
      return (
        p.x >= 0 &&
        p.x <= container.clientWidth &&
        p.y >= 0 &&
        p.y <= container.clientHeight
      );
    }

    let fallback: number | undefined;
    
    if (pinOnScreen()) {
      lockPlacement();
    } else {
      setPlacement(null);
      map.once("moveend", lockPlacement);
      fallback = window.setTimeout(lockPlacement, 1400);
    }

    function onResize() {
      if (!focusedMedia) return;
      const next = computePlacement();
      placementCacheRef.current = { id: focusedMedia.id, placement: next };
      setPlacement(next);
    }

    map.on("resize", onResize);
    return () => {
      map.off("moveend", lockPlacement);
      if (fallback) window.clearTimeout(fallback);
      map.off("resize", onResize);
    };

    
  }, [map, focusedMedia, collectionLocations]);

  if (!map || !focusedMedia || !placement) return null;

  const mapContainer = map.getContainer();

  return createPortal(
    <div
     className="absolute z-20 w-[min(18rem,calc(100%-1.5rem))] max-h-[min(40vh,320px)] overflow-y-auto rounded-xl border border-border/60 bg-background/70 backdrop-blur-sm shadow-lg pointer-events-auto"
      style={{
        left: placement.left,
        top: placement.top,
        transform: placement.transform,
      }}
      role="dialog"
      aria-label="Catalog entry"
    >
      <div className="flex items-center justify-between gap-2 px-3 py-1 border-b min-h-0">
        <span className="text-xs font-medium text-muted-foreground leading-none">
          In this collection
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={clearFocus}
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="p-3">
        <MediaEntryPanel media={focusedMedia} />
      </div>
    </div>,
    mapContainer
  );
}
