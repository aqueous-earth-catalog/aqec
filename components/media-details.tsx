"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Media, MediaLocation } from "@/lib/airtable/types";
import { Metric } from "@/components/metric";
import Link from "next/link";
import { Label } from "./ui/label";
import { updateQueryParameters } from "@/lib/utils";

interface MediaDetailsProps {
  media: Media;
  locations: MediaLocation[];
}

export function MediaDetails({ media, locations }: MediaDetailsProps) {
  return (
    <Card className="border-0 shadow-none rounded-none">
      <div className="px-4 pb-4">
        <CardHeader className="p-0">
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary">Media</Badge>
            {media.media_type && (
              <Badge className="capitalize" variant="outline">
                {media.media_type}
              </Badge>
            )}
          </div>
          <div>
            <CardTitle
              id="media-title"
              className="text-xl font-bold"
              role="heading"
              aria-level={2}
            >
              {media.name}
              {media.release_year ? ` (${media.release_year})` : ""}
            </CardTitle>
            <p
              id="media-description"
              className="text-md text-muted-foreground"
            >
              Created by {media.director}
            </p>
            {media.video_link && (
              <Button variant="outline" size="sm" asChild className="my-2">
                <Link
                  href={media.video_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch Video
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>

          {media.image?.url && (
            <div className="-mx-4 w-[calc(100%+2rem)] overflow-hidden bg-muted">
              <Image
                src={media.image.url || ""}
                alt={`Image from ${media.name || "unknown media"} (${
                  media.release_year || "unknown year"
                }) by ${media.director || "unknown director"}`}
                width={media.image.width || 1600}
                height={media.image.height || 900}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="w-full h-auto"
              />
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0 mt-3">
          <Metric label="Language" value={media.language} />
          <Metric
            label="Summary"
            value={media.description || ""}
            className="mt-3"
          />
          <Metric
            label="Subjects"
            value={media.subjects}
            className="mt-3"
          />

          {locations.length > 0 && (
            <>
              <Label className="text-xs font-semibold tracking-relaxed mt-3">
                Media locations
              </Label>
              <ul className="ml-5 list-disc">
                {locations.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="text-sm text-left text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                      onClick={() => {
                        window.history.pushState(
                          {},
                          "",
                          updateQueryParameters({
                            mediaPointId: item.id,
                            mediaId: null,
                          })
                        );
                      }}
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          <Metric
            href={media.rights_statement_link || ""}
            label="Media Rights"
            value={media.rights || ""}
            className="mt-3"
          />
        </CardContent>
      </div>
    </Card>
  );
}
