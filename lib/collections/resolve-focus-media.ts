import type { MediaLocation } from "@/lib/airtable/types";

function norm(s: string) {
  return s.trim().toLowerCase();
}

function mediaTitle(loc: MediaLocation): string {
  return loc.media?.name ?? loc.name ?? "";
}

export function resolveFocusMediaByTitle(
  title: string,
  locations: MediaLocation[]
): MediaLocation | null {
  const q = norm(title);
  if (!q || locations.length === 0) return null;

  const exact = locations.filter((loc) => norm(mediaTitle(loc)) === q);
  if (exact.length === 1) return exact[0];

  const partial = locations.filter((loc) => norm(mediaTitle(loc)).includes(q));
  if (partial.length === 1) return partial[0];

  return null;
}
