import type { MediaLocation } from "@/lib/airtable/types";

function norm(s: string) {
  return s.trim().toLowerCase();
}

/** Drop a leading "the " so "The Beach" and "Beach" can match. */
function stripThe(s: string) {
  return norm(s).replace(/^the\s+/, "");
}

function mediaTitle(loc: MediaLocation): string {
  return loc.media?.name ?? loc.name ?? "";
}

export function resolveFocusMediaByTitle(
  title: string,
  locations: MediaLocation[]
): MediaLocation | null {
  const q = norm(title);
  const qBare = stripThe(title);
  if ((!q && !qBare) || locations.length === 0) return null;

  const candidates = locations.map((loc) => ({
    loc,
    name: norm(mediaTitle(loc)),
    bare: stripThe(mediaTitle(loc)),
  }));

  // 1) Exact (with or without leading "The")
  const exact = candidates.filter(
    (c) => c.name === q || c.bare === qBare || c.name === qBare || c.bare === q
  );
  if (exact.length === 1) return exact[0].loc;

  // 2) Catalog name contains query
  const partial = candidates.filter(
    (c) => c.name.includes(q) || c.bare.includes(qBare)
  );
  if (partial.length === 1) return partial[0].loc;

  // 3) Query contains catalog name (e.g. title="The Beach (2000)" vs catalog "The Beach")
  const reverse = candidates.filter(
    (c) =>
      (c.name.length >= 4 && q.includes(c.name)) ||
      (c.bare.length >= 4 && qBare.includes(c.bare))
  );
  if (reverse.length === 1) return reverse[0].loc;

  return null;
}
