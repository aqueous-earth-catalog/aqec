"use client";

import { X } from "lucide-react";
import type { MediaLocation } from "@/lib/airtable/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCollectionMap } from "@/components/collections/collection-map-context";

function buildPlace(media: MediaLocation): string {
  return [media.city, media.region, media.country].filter(Boolean).join(", ");
}

interface MediaEntryPanelProps {
  media: MediaLocation;
}

function MediaEntryPanel({ media }: MediaEntryPanelProps) {
  const title = media.media?.name ?? media.name;
  const year = media.media?.release_year;
  const director = media.media?.director;
  const place = buildPlace(media);

  return (
    <div className="space-y-2">
      {media.media?.media_type && (
        <Badge variant="secondary" className="capitalize text-xs">
          {media.media.media_type}
        </Badge>
      )}
      <p className="font-medium text-sm leading-snug">
        {title}
        {year ? ` (${year})` : ""}
      </p>
      {director && (
        <p className="text-xs text-muted-foreground">Created by {director}</p>
      )}
      {place && (
        <p className="text-xs text-muted-foreground">{place}</p>
      )}
    </div>
  );
}

export function MapFocusPanel() {
  const { focusedMedia, clearFocus } = useCollectionMap();

  if (!focusedMedia) return null;

  return (
    <div
      className="absolute bottom-4 left-4 z-20 max-w-sm max-h-[min(50vh,400px)] overflow-y-auto rounded-xl border bg-background shadow-lg"
      role="dialog"
      aria-label="Catalog entry"
    >
      <div className="flex items-start justify-between gap-2 p-3 border-b">
        <span className="text-xs font-medium text-muted-foreground">
          In this collection
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={clearFocus}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-3">
        <MediaEntryPanel media={focusedMedia} />
      </div>
    </div>
  );
}
