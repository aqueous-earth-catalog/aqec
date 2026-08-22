import { Media, MediaLocation, MediaSearchResult } from "@/lib/airtable/types";
import { SHOW_MEDIA_IN_EMPTY_SEARCH } from "@/lib/feature-flags";

// Utility function used to fuzzy search across media and location fields
export function matchesSearch(media: MediaLocation, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const searchable = [
    media.name,
    media.city,
    media.country,
    media.region,
    media.location_name,
    media.natural_feature_name,
    media.media?.name,
    media.media?.media_type,
    media.media?.director,
    media.media?.release_year?.toString(),
    media.media?.subjects?.join(" "),
    media.media?.language?.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return searchable.includes(q);
}

export function matchesMediaSearch(media: Media, query: string): boolean {
  if (!query.trim()) return SHOW_MEDIA_IN_EMPTY_SEARCH;
  const q = query.toLowerCase();
  const searchable = [
    media.name,
    media.original_title,
    media.director,
    media.subjects?.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return searchable.includes(q);
}

export function collectMatchingMedia(
  locations: MediaLocation[],
  query: string
): MediaSearchResult[] {
  if (!query.trim() && !SHOW_MEDIA_IN_EMPTY_SEARCH) return [];

  const seen = new Map<string, Media>();
  for (const location of locations) {
    if (!location.media_id || !location.media) continue;
    if (seen.has(location.media_id)) continue;
    if (matchesMediaSearch(location.media, query)) {
      seen.set(location.media_id, location.media);
    }
  }

  return [...seen.entries()]
    .map(([id, media]) => ({ id, media }))
    .sort((a, b) => a.media.name.localeCompare(b.media.name));
}
