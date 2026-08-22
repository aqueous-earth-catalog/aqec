import { Media, MediaLocation } from "@/lib/airtable/types";
import { Badge } from "./ui/badge";
import { updateQueryParameters } from "@/lib/utils";

interface ResultCardProps {
  media: MediaLocation;
  isSelected: boolean;
}

export function ResultCard({ media, isSelected }: ResultCardProps) {
  function handleSelect() {
    window.history.pushState(
      {},
      "",
      updateQueryParameters({
        mediaPointId: media.id,
        mediaId: null,
      })
    );
  }

  return (
    <button
      onClick={handleSelect}
      className={`w-full text-left p-3 border-b border-border hover:bg-accent/50 transition-colors cursor-pointer ${
        isSelected ? "bg-accent" : ""
      }`}
      aria-label={`Select Media location ${media.name}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-2">
          <p className="font-medium text-sm truncate">
            {media.name}{" "}
            {media.media?.release_year && `(${media.media.release_year})`}
          </p>
          {(media.country || media.media?.director) && (
            <p className="text-xs text-muted-foreground truncate">
              {[media.country, media.media?.director]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
        <Badge variant="secondary" className="text-xs shrink-0">
          Media location
        </Badge>
      </div>
    </button>
  );
}

interface MediaResultCardProps {
  id: string;
  media: Media;
  isSelected: boolean;
}

export function MediaResultCard({
  id,
  media,
  isSelected,
}: MediaResultCardProps) {
  function handleSelect() {
    window.history.pushState(
      {},
      "",
      updateQueryParameters({
        mediaId: id,
        mediaPointId: null,
      })
    );
  }

  return (
    <button
      onClick={handleSelect}
      className={`w-full text-left p-3 border-b border-border hover:bg-accent/50 transition-colors cursor-pointer ${
        isSelected ? "bg-accent" : ""
      }`}
      aria-label={`Select Media ${media.name}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-2">
          <p className="font-medium text-sm truncate">
            {media.name} {media.release_year && `(${media.release_year})`}
          </p>
          {media.director && (
            <p className="text-xs text-muted-foreground truncate">
              {media.director}
            </p>
          )}
        </div>
        <Badge variant="secondary" className="text-xs shrink-0">
          Media
        </Badge>
      </div>
    </button>
  );
}
