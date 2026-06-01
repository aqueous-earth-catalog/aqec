import { Suspense, type ReactNode } from "react";
import { getCollections, getMediaPoints } from "@/app/data";
import { renderCollectionBody } from "@/lib/collections/render-collection-body";
import CollectionsContainer from "@/components/collections/collections-container";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const [collections, allMediaPoints] = await Promise.all([
    getCollections(),
    getMediaPoints(),
  ]);

  // Pre-render each essay's MDX on the server, keyed by collection id.
  const bodyById: Record<string, ReactNode> = {};

  for (const collection of collections) {
    if (!collection.body_repo_slug) continue;
    bodyById[collection.id] = await renderCollectionBody(
      collection.body_repo_slug
    );
  }

  return (
    <div className="w-full h-full relative">
      <h1 className="sr-only">Collections</h1>
      <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading collections…</div>}>
        <CollectionsContainer
          collections={collections}
          allMediaPoints={allMediaPoints}
          bodyById={bodyById}
        />
      </Suspense>
    </div>
  );
}
