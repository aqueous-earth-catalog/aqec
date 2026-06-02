"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { Collection, MediaLocation } from "@/lib/airtable/types";
import { addQueryParameter, removeQueryParameter } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ResultCard } from "@/components/result-card";
import { useIsTablet } from "@/components/hooks/use-tablet";

interface CollectionsDrawerProps {
  collections: Collection[];
  bodyById: Record<string, ReactNode>;
  locationsForSelectedCollection: MediaLocation[];
  isOpen: boolean;
  onToggle: () => void;
  drawerWidthPx: number;
  onDrawerWidthChange: (width: number) => void;
  onDrawerWidthCommit: (width: number) => void;
}

export function CollectionsDrawer({
  collections,
  bodyById,
  locationsForSelectedCollection,
  isOpen,
  onToggle,
  drawerWidthPx,
  onDrawerWidthChange,
  onDrawerWidthCommit,
}: CollectionsDrawerProps) {
  const searchParams = useSearchParams();
  const collectionId = searchParams.get("collectionId");
  const mediaPointId = searchParams.get("mediaPointId");
  const isMobile = useIsTablet();
  const drawerRef = useRef<HTMLDivElement>(null);

  const selectedCollection = collectionId
    ? collections.find((c) => c.id === collectionId)
    : null;

  const body = selectedCollection
    ? bodyById[selectedCollection.id] ?? null
    : null;

  const startResize = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const startX = event.clientX;
      const startW = drawerWidthPx;
      function onMove(moveEvent: MouseEvent) {
        onDrawerWidthChange(startW + (moveEvent.clientX - startX));
      }
      function onUp(moveEvent: MouseEvent) {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        onDrawerWidthCommit(startW + (moveEvent.clientX - startX));
      }
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [drawerWidthPx, onDrawerWidthChange, onDrawerWidthCommit]
  );

  function handleSelectCollection(id: string) {
    window.history.pushState({}, "", addQueryParameter("collectionId", id));
  }

  function handleBackToList() {
    window.history.pushState({}, "", removeQueryParameter("collectionId"));
  }

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (selectedCollection) handleBackToList();
        else onToggle();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedCollection, onToggle]);

  useEffect(() => {
    if (isOpen && drawerRef.current) drawerRef.current.focus();
  }, [isOpen, selectedCollection]);

  if (!isOpen) {
    if (isMobile) {
      return (
        <Button
          variant="outline"
          size="lg"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 rounded-full px-6 shadow-md bg-background text-base"
          onClick={onToggle}
          aria-label="Open collections panel"
        >
          <ChevronUp className="h-5 w-5" />
          Collections
        </Button>
      );
    }
    return (
      <Button
        variant="outline"
        size="icon"
        className="absolute top-2 left-2 z-10 bg-background shadow-lg"
        onClick={onToggle}
        aria-label="Open collections panel"
      >
        <PanelLeftOpen className="h-4 w-4" />
      </Button>
    );
  }

  const drawerContent = selectedCollection ? (
    <div className="flex flex-col overflow-hidden flex-1 min-w-0">
    <div className="flex items-center justify-between pl-6 pr-4 pt-2 shrink-0">
      <Button variant="ghost" size="sm" onClick={handleBackToList} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label="Close panel"
          className="h-8 w-8"
        >
          {isMobile ? <ChevronDown className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>
      <div className="overflow-y-auto flex-1 styled-scrollbar pl-6 pr-4 pb-4 space-y-6">
      <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed">
          <h2>{selectedCollection.title}</h2>
        </div>
        {body ?? (
          <p className="text-sm text-muted-foreground">
            No article text found. Add{" "}
            <code className="text-xs">content/collections/&lt;slug&gt;/index.mdx</code>{" "}
            and register it in{" "}
            <code className="text-xs">content/collections/registry.ts</code>.
          </p>
        )}
        {locationsForSelectedCollection.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Works in this collection
            </h3>
            {locationsForSelectedCollection.map((point) => (
              <ResultCard key={point.id} media={point} isSelected={point.id === mediaPointId} />
            ))}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="flex flex-col overflow-hidden flex-1 min-w-0">
      <div className="flex items-center justify-between p-3 shrink-0">
        <h2 className="text-sm font-medium">Collections</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label="Close panel"
          className="h-8 w-8"
        >
          {isMobile ? <ChevronDown className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>
      <div className="overflow-y-auto flex-1 styled-scrollbar">
        {collections.map((collection) => (
          <button
            key={collection.id}
            type="button"
            onClick={() => handleSelectCollection(collection.id)}
            className="w-full text-left p-3 border-b border-border hover:bg-accent/50 transition-colors"
          >
            <p className="font-medium text-sm">{collection.title}</p>
            {collection.teaser && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{collection.teaser}</p>
            )}
          </button>
        ))}
        {collections.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground text-center">
            No published collections yet.
          </p>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div
        ref={drawerRef}
        tabIndex={-1}
        role="region"
        aria-label={selectedCollection ? "Collection detail" : "Collections list"}
        className="absolute bottom-0 left-0 right-0 z-10 h-[60%] bg-background flex flex-col shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] rounded-t-2xl focus:outline-none"
      >
        {drawerContent}
      </div>
    );
  }

  return (
    <div
      ref={drawerRef}
      tabIndex={-1}
      role="region"
      aria-label={selectedCollection ? "Collection detail" : "Collections list"}
      className="relative h-full z-10 bg-background flex flex-col shadow-lg focus:outline-none min-w-0 overflow-hidden"
      style={{ width: drawerWidthPx > 0 ? drawerWidthPx : "40vw" }}
    >
      {drawerContent}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize side panel"
        className="absolute top-0 right-0 bottom-0 w-3 -mr-1.5 cursor-ew-resize z-20 flex shrink-0 justify-center touch-none select-none"
        onMouseDown={startResize}
      >
        <span className="w-px h-full bg-border hover:bg-primary/50 active:bg-primary transition-colors" />
      </div>
    </div>
  );
}
