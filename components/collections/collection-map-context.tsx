"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  const focusedMediaRef = useRef<MediaLocation | null>(null);
  const flySuppressUntilRef = useRef(0);
  focusedMediaRef.current = focusedMedia;

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
    const duration = reduced ? 0 : 800;

    flySuppressUntilRef.current = Date.now() + duration + 150;

    mapInstance.flyTo({
      center: [media.longitude, media.latitude],
      zoom: FOCUS_FLY_ZOOM,
      duration,
    });
  }, []);
  
  const clearFocus = useCallback(() => {
    setFocusedMedia(null);
  }, []);

  useEffect(() => {
    if (!map) return;

    function onMoveEnd() {
      if (Date.now() < flySuppressUntilRef.current) return;

      const focused = focusedMediaRef.current;
      if (!focused) return;

      const bounds = map.getBounds();
      const inView = bounds.contains([focused.longitude, focused.latitude]);
      if (!inView) {
        setFocusedMedia(null);
      }
    }

    map.on("moveend", onMoveEnd);
    return () => {
      map.off("moveend", onMoveEnd);
    };
  }, [map]);
  
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
