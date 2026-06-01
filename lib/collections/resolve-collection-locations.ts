import type { Collection, MediaLocation } from "@/lib/airtable/types";

/**
 * Map pins for a collection: explicit locations + all pins for linked Media.
 * Deduped by location id.
 */
export function resolveLocationsForCollection(
  collection: Collection,
  allMediaPoints: MediaLocation[]
): MediaLocation[] {
  const explicitIds = new Set(collection.linked_media_locations ?? []);
  const mediaIds = new Set(collection.linked_media ?? []);

  const byId = new Map<string, MediaLocation>();

  for (const point of allMediaPoints) {
    const isExplicit = explicitIds.has(point.id);
    const isFromMedia = point.media_id != null && mediaIds.has(point.media_id);

    if (isExplicit || isFromMedia) {
      byId.set(point.id, point);
    }
  }

  return Array.from(byId.values());
}
