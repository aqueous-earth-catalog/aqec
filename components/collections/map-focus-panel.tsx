"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { MediaLocation } from "@/lib/airtable/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCollectionMap } from "@/components/collections/collection-map-context";

const HEADLINE_CLASS = "font-medium text-sm leading-snug";
const PANEL_EST_WIDTH = 288;
const PANEL_EST_HEIGHT = 160;
const PIN_BUFFER = 20;
const EDGE_PADDING = 12;
const PIN_OFFSET = 12;

function buildPlace(media: MediaLocation): string {
  return [media.city, media.region, media.country].filter(Boolean).join(", ");
}

function locationLine(media: MediaLocation): string {
  return media.name || media.location_name || buildPlace(media) || "";
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
    const right = pinX - PIN_OFFSET;
    return { left: right - w, top: pinY - h / 2, right, bottom: pinY + h / 2 };
  }
  if (side === "right") {
    const left = pinX + PIN_OFFSET;
    return { left, top: pinY - h / 2, right: left + w, bottom: pinY + h / 2 };
  }
  if (side === "above") {
    const bottom = pinY - PIN_OFFSET;
    return { left: pinX - w / 2, top: bottom - h, right: pinX + w / 2, bottom };
  }
  const top = pinY + PIN_OFFSET;
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

function scorePlacement(
  rect: { left: number; top: number; right: number; bottom: number },
  mapW: number,
  mapH: number,
  otherPins: { x: number; y: number }[]
): number {
  let score = 0;

  if (rect.left < EDGE_PADDING) score -= 800;
  if (rect.top < EDGE_PADDING) score -= 400;
  if (rect.right > mapW - EDGE_PADDING) score -= 800;
  if (rect.bottom > mapH - EDGE_PADDING) score -= 400;

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
    "left",
    "right",
    "above",
    "below",
  ];

  const transforms: Record<string, string> = {
    left: "translate(-100%, -50%)",
    right: "translate(0, -50%)",
    above: "translate(-50%, -100%)",
    below: "translate(-50%, 0)",
  };

  let best: PanelPlacement = {
    left: focusedPin.x - PIN_OFFSET,
    top: focusedPin.y,
    transform: "translate(-100%, -50%)",
  };
  let bestScore = -Infinity;

  for (const side of sides) {
    const rect = panelRect(focusedPin.x, focusedPin.y, side);
    const score = scorePlacement(rect, mapW, mapH, otherPins);
    if (score > bestScore) {
      bestScore = score;
      best = {
        left: side === "left" ? focusedPin.x - PIN_OFFSET : side === "right" ? focusedPin.x + PIN_OFFSET : focusedPin.x,
        top: side === "above" ? focusedPin.y - PIN_OFFSET : side === "below" ? focusedPin.y + PIN_OFFSET : focusedPin.y,
        transform: transforms[side],
      };
    }
  }

  return best;
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

    if (placementCacheRef.current?.id === focusedMedia.id) {
      setPlacement(placementCacheRef.current.placement);
    } else {
      const next = computePlacement();
      placementCacheRef.current = { id: focusedMedia.id, placement: next };
      setPlacement(next);
    }

    function onResize() {
      const next = computePlacement();
      placementCacheRef.current = {
        id: focusedMedia!.id,
        placement: next,
      };
      setPlacement(next);
    }

    map.on("resize", onResize);
    return () => {
      map.off("resize", onResize);
    };
  }, [map, focusedMedia, collectionLocations]);

  if (!focusedMedia || !placement) return null;

  return (
    <div
      className="absolute z-20 w-[min(18rem,calc(100%-1.5rem))] max-h-[min(40vh,320px)] overflow-y-auto rounded-xl border bg-background shadow-lg pointer-events-auto"
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
    </div>
  );
}
