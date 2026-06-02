import type { ComponentType } from "react";

/** An imported `.mdx` module exposes the body as its default export. */
type MDXModule = { default: ComponentType };

/** slug (Body Repo Slug in Airtable) → loader for that essay's MDX. */
export const COLLECTION_BODIES: Record<string, () => Promise<MDXModule>> = {
  example: () => import("@/content/collections/example/index.mdx"),
  "desert-island": () => import("@/content/collections/desert-island/index.mdx"),
};
