import { MediaLocation } from "@/lib/airtable/types";
import { Badge } from "./ui/badge";
import { addQueryParameter } from "@/lib/utils";

interface ResultCardProps {
  media: MediaLocation;
  isSelected: boolean;
}

export function ResultCard({ media, isSelected }: ResultCardProps) {
  function handleSelect() {
    const params = addQueryParameter("mediaPointId", media.id);
    window.history.pushState({}, "", params);
  }

  return (
    <button
      onClick={handleSelect}
      className={`w-full text-left p-3 border-b border-border hover:bg-accent/50 transition-colors cursor-pointer ${
        isSelected ? "bg-accent" : ""
      }`}
      aria-label={`Select ${media.name}`}
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
        {media.media?.media_type && (
          <Badge variant="secondary" className="capitalize text-xs shrink-0">
            {media.media.media_type}
          </Badge>
        )}
      </div>
    </button>
  );
}
