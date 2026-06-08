"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { MediaLocation } from "@/lib/airtable/types";

const FOCUS_FLY_ZOOM = 4;

type CollectionMapContextValue = {
  focusedMedia: MediaLocation | null;
  collectionLocations: MediaLocation[];
  map: mapboxgl.Map | null;
  focusOnMedia: (media: MediaLocation) => void;
  clearFocus: () => void;
  registerMap: (map: mapboxgl.Map | null) => void;
};

const CollectionMapContext = createContext<CollectionMapContextValue | null>(
  null
);

interface CollectionMapProviderProps {
  children: ReactNode;
  collectionLocations: MediaLocation[];
}

export function CollectionMapProvider({
  children,
  collectionLocations,
}: CollectionMapProviderProps) {
  const [focusedMedia, setFocusedMedia] = useState<MediaLocation | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const registerMap = useCallback((mapInstance: mapboxgl.Map | null) => {
    mapRef.current = mapInstance;
    setMap(mapInstance);
  }, []);

  const focusOnMedia = useCallback((media: MediaLocation) => {
    setFocusedMedia(media);
    const mapInstance = mapRef.current;
    if (!mapInstance) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    mapInstance.flyTo({
      center: [media.longitude, media.latitude],
      zoom: FOCUS_FLY_ZOOM,
      duration: reduced ? 0 : 800,
    });
  }, []);

  const clearFocus = useCallback(() => {
    setFocusedMedia(null);
  }, []);

  const value: CollectionMapContextValue = {
    focusedMedia,
    collectionLocations,
    map,
    focusOnMedia,
    clearFocus,
    registerMap,
  };

  return (
    <CollectionMapContext.Provider value={value}>
      {children}
    </CollectionMapContext.Provider>
  );
}

export function useCollectionMap() {
  const ctx = useContext(CollectionMapContext);
  if (!ctx) {
    throw new Error(
      "useCollectionMap must be used within CollectionMapProvider"
    );
  }
  return ctx;
}
