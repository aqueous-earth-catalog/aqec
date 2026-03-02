"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { CircleX, ExternalLink } from "lucide-react";
import { MediaLocation } from "@/lib/airtable/types";
import { Metric } from "@/components/metric";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { removeQueryParameter } from "@/lib/utils";
import { Label } from "./ui/label";

interface LocationDetailsProps {
  data: MediaLocation[];
}

const CONTAINER_CLASS = {
  visible:
    "fixed bottom-0 left-0 right-0 bg-background z-50 rounded-t-3xl rounded-b-none shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] max-h-[65vh] overflow-clip py-0 md:absolute md:top-18 md:left-6 md:right-auto md:w-96 md:max-w-[calc(50vw-2rem)] md:rounded-xl md:shadow-2xl md:!h-fit md:overflow-clip lg:top-22",
  hidden: "hidden",
};

const SCROLL_CLASS = "overflow-y-auto h-full p-4 styled-scrollbar";

/**
 * Builds a formatted location string from city, region, and country components.
 *
 * @param city - The city name (optional)
 * @param region - The region/state/province name (optional)
 * @param country - The country name (optional)
 * @returns A comma-separated string of available location parts, or empty string if none provided
 *
 * @example
 * buildLocationString("San Francisco", "California", "USA") // "San Francisco, California, USA"
 * buildLocationString("Paris", undefined, "France") // "Paris, France"
 * buildLocationString(null, null, "USA") // "USA"
 * buildLocationString() // "" (empty string, will show "None" via Metric fallback)
 */
function buildLocationString(
  city?: string,
  region?: string,
  country?: string
): string {
  // Filter out null, undefined, and empty string values
  const locationParts = [city, region, country].filter(
    (part) => part && part.trim() !== ""
  );

  // Join remaining parts with comma and space
  return locationParts.join(", ");
}

export function LocationDetails({ data }: LocationDetailsProps) {
  const searchParams = useSearchParams();
  const mediaPointId = searchParams.get("mediaPointId");
  const cardRef = useRef<HTMLDivElement>(null);

  // Focus management and keyboard support
  useEffect(() => {
    if (mediaPointId && cardRef.current) {
      // Focus the card when it opens
      cardRef.current.focus();

      // Handle Escape key to close
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          handleClose();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [mediaPointId]);

  const selectedMediaPoint = mediaPointId
    ? data.find((point) => point.id === mediaPointId)
    : null;

  function handleClose() {
    window.history.pushState({}, "", removeQueryParameter("mediaPointId"));
  }

  if (!selectedMediaPoint) return null;

  const relatedMedia = data.filter(
    (d) =>
      selectedMediaPoint?.media?.related_media_locations?.includes(d.id) &&
      d.id !== selectedMediaPoint.id
  );

  return (
    <Card
      ref={cardRef}
      tabIndex={mediaPointId ? 0 : -1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-title"
      aria-describedby="location-description"
      className={`${mediaPointId ? CONTAINER_CLASS.visible : CONTAINER_CLASS.hidden}`}
    >
      <div className={SCROLL_CLASS}>
        <CardHeader className="p-0">
          <Badge className="capitalize" variant="secondary">
            {selectedMediaPoint?.media?.media_type}
          </Badge>
          <div className="flex justify-between gap-1">
            <div>
              <CardTitle
                id="location-title"
                className="text-xl font-bold"
                role="heading"
                aria-level={2}
              >
                {selectedMediaPoint?.media?.name} (
                {selectedMediaPoint?.media?.release_year})
              </CardTitle>
              <p
                id="location-description"
                className="text-md text-muted-foreground"
              >
                Created by {selectedMediaPoint?.media?.director}
              </p>
              {selectedMediaPoint?.media?.video_link && (
                <Button variant="outline" size="sm" asChild className="mt-2">
                  <Link
                    href={selectedMediaPoint?.media?.video_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Watch Video
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <CircleX className="size-6" />
            </Button>
          </div>

          {selectedMediaPoint?.media?.image?.url && (
            <div className="relative w-full h-50 mt-2">
              <Image
                src={selectedMediaPoint.media.image.url || ""}
                alt={`Image from ${
                  selectedMediaPoint.media.name || "unknown media"
                } (${
                  selectedMediaPoint.media.release_year || "unknown year"
                }) by ${selectedMediaPoint.media.director || "unknown director"}`}
                fill
                className="object-cover rounded"
              />
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <Metric
            label="Language"
            value={selectedMediaPoint?.media?.language}
          />
          <Metric
            label="Summary"
            value={selectedMediaPoint?.media?.description || ""}
            className="mt-3"
          />
          <Metric
            label="Nearest Location"
            value={buildLocationString(
              selectedMediaPoint?.city,
              selectedMediaPoint?.region,
              selectedMediaPoint?.country
            )}
            className="mt-3"
          />

          <Metric
            label="Natural Feature"
            value={selectedMediaPoint?.natural_feature_name}
            className="mt-3"
          />

          <Metric
            label="Subjects"
            value={selectedMediaPoint?.media?.subjects}
            className="mt-3"
          />

          {relatedMedia.length > 0 && (
            <>
              <Label className="text-xs text-muted-foreground mt-3">
                Associated Media Locations
              </Label>
              <ul className="ml-5 list-disc">
                {relatedMedia.map((item, index) => (
                  <li key={`associated-media-${index}`}>
                    <Link
                      className="text-sm flex items-center gap-1 text-primary underline underline-offset-2 hover:text-primary/80 transition-colors w-fit"
                      href={`/?mediaPointId=${item.id}`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          <Metric
            href={selectedMediaPoint?.media?.rights_statement_link || ""}
            label="Media Rights"
            value={selectedMediaPoint?.media?.rights || ""}
            className="mt-3"
          />

          <div className="flex justify-end mt-6">
            <Button
              variant="outline"
              className="hidden md:flex"
              onClick={handleClose}
            >
              Close
              <CircleX />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
