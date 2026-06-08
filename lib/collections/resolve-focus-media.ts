import type { MediaLocation } from "@/lib/airtable/types";

function norm(s: string) {
  return s.trim().toLowerCase();
}

/** Drop a leading "the " so "The Beach" and "Beach" can match. */
function stripThe(s: string) {
  return norm(s).replace(/^the\s+/, "");
}

type Candidate = {
  loc: MediaLocation;
  label: string;
  bare: string;
};

function candidate(loc: MediaLocation, text: string): Candidate | null {
  if (!text.trim()) return null;
  return { loc, label: norm(text), bare: stripThe(text) };
}

/** Location name first, then film name — so multi-pin films can disambiguate. */
function candidatesForLocation(loc: MediaLocation): Candidate[] {
  const out: Candidate[] = [];
  const locName = loc.name?.trim() ?? "";
  const filmName = loc.media?.name?.trim() ?? "";

  const locCand = candidate(loc, locName);
  if (locCand) out.push(locCand);

  if (filmName && filmName !== locName) {
    const filmCand = candidate(loc, filmName);
    if (filmCand) out.push(filmCand);
  }

  return out;
}

function isExact(c: Candidate, q: string, qBare: string) {
  return (
    c.label === q ||
    c.bare === qBare ||
    c.label === qBare ||
    c.bare === q
  );
}

function isPartial(c: Candidate, q: string, qBare: string) {
  return c.label.includes(q) || c.bare.includes(qBare);
}

function isReverse(c: Candidate, q: string, qBare: string) {
  return (
    (c.label.length >= 4 && q.includes(c.label)) ||
    (c.bare.length >= 4 && qBare.includes(c.bare))
  );
}

function uniqueLocation(matches: Candidate[]): MediaLocation | null {
  const ids = new Set(matches.map((m) => m.loc.id));
  return ids.size === 1 ? matches[0].loc : null;
}

export function resolveFocusMediaByTitle(
  title: string,
  locations: MediaLocation[]
): MediaLocation | null {
  const q = norm(title);
  const qBare = stripThe(title);
  if ((!q && !qBare) || locations.length === 0) return null;

  const candidates = locations.flatMap(candidatesForLocation);

  const exact = candidates.filter((c) => isExact(c, q, qBare));
  const exactMatch = uniqueLocation(exact);
  if (exactMatch) return exactMatch;

  const partial = candidates.filter((c) => isPartial(c, q, qBare));
  const partialMatch = uniqueLocation(partial);
  if (partialMatch) return partialMatch;

  const reverse = candidates.filter((c) => isReverse(c, q, qBare));
  return uniqueLocation(reverse);
}
