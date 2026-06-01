import type { ReactNode } from "react";
import { COLLECTION_BODIES } from "@/content/collections/registry";

export async function renderCollectionBody(slug: string): Promise<ReactNode> {
  const load = COLLECTION_BODIES[slug];
  if (!load) return null;

  try {
    const mod = await load();
    const Body = mod.default;
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed">
        <Body />
      </div>
    );
  } catch {
    return null;
  }
}
