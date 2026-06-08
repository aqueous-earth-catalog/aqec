"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import type { Collection, MapFilters, MediaLocation } from "@/lib/airtable/types";
import { resolveLocationsForCollection } from "@/lib/collections/resolve-collection-locations";
import { computeMapBounds, removeQueryParameter } from "@/lib/utils";
import { Map } from "@/components/map";
import { STYLES, MapStyle } from "@/lib/map-utils";
import { CollectionsDrawer } from "@/components/collections/collections-drawer";
import { BasemapToggle } from "@/components/basemap-toggle";
import { useIsTablet } from "@/components/hooks/use-tablet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CollectionMapProvider, useCollectionMap } from "@/components/collections/collection-map-context";
import { MapFocusPanel } from "@/components/collections/map-focus-panel";

const MIN_DRAWER_WIDTH_PX = 280;
const DEFAULT_DRAWER_WIDTH_WIDE_PX = 384;

const EMPTY_FILTERS: MapFilters = {
  countries: [],
  regions: [],
  bodiesOfWater: [],
  startYear: "",
  endYear: "",
};

/** Collections view: left panel starts at 40% of the window. */
function defaultCollectionsDrawerWidthPx(): number {
  if (typeof window === "undefined") return DEFAULT_DRAWER_WIDTH_WIDE_PX;
  return Math.floor(window.innerWidth * 0.4);
}

function maxDrawerWidthPx(): number {
  if (typeof window === "undefined") return DEFAULT_DRAWER_WIDTH_WIDE_PX * 2;
  return Math.floor(window.innerWidth * 0.5);
}

function clampDrawerWidthPx(w: number): number {
  const max = maxDrawerWidthPx();
  return Math.min(max, Math.max(MIN_DRAWER_WIDTH_PX, Math.round(w)));
}

interface CollectionsContainerProps {
  collections: Collection[];
  allMediaPoints: MediaLocation[];
  bodyById: Record<string, ReactNode>;
}
interface CollectionsContainerBodyProps extends CollectionsContainerProps {
  collectionLocations: MediaLocation[];
}

export default function CollectionsContainer(props: CollectionsContainerProps) {
  const searchParams = useSearchParams();
  const collectionId = searchParams.get("collectionId");

  const selectedCollection = collectionId
    ? props.collections.find((c) => c.id === collectionId)
    : null;

  const collectionLocations = useMemo(() => {
    if (!selectedCollection) return [];
    return resolveLocationsForCollection(selectedCollection, props.allMediaPoints);
  }, [selectedCollection, props.allMediaPoints]);

  return (
    <CollectionMapProvider collectionLocations={collectionLocations}>
      <CollectionsContainerBody
        {...props}
        collectionLocations={collectionLocations}
      />
    </CollectionMapProvider>
  );
}

function CollectionsContainerBody({
  collections,
  allMediaPoints,
  bodyById,
  collectionLocations,
}: CollectionsContainerBodyProps) {
  
  const searchParams = useSearchParams();
  const collectionId = searchParams.get("collectionId");
  const mediaPointId = searchParams.get("mediaPointId");
  const [prevCollectionId, setPrevCollectionId] = useState(collectionId);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [mapStyle, setMapStyle] = useState<MapStyle>("standard");
  // 0 = no measured width yet; drawer renders CSS 40vw until the layout effect runs.
  const [drawerWidthPx, setDrawerWidthPx] = useState(0);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const isTablet = useIsTablet();
  const { registerMap, focusOnMedia, focusedMedia } = useCollectionMap();
  
  useLayoutEffect(() => {
    setDrawerWidthPx(clampDrawerWidthPx(defaultCollectionsDrawerWidthPx()));
  }, []);

  const collectionMapBounds = useMemo(
    () => computeMapBounds(collectionLocations),
    [collectionLocations]
  );
  const catalogMapBounds = useMemo(
    () => computeMapBounds(allMediaPoints),
    [allMediaPoints]
  );
  const mapBounds = collectionId ? collectionMapBounds : catalogMapBounds;

  useEffect(() => {
    if (isTablet) return;
    if (!mapInstanceRef.current) return;
    const id1 = window.requestAnimationFrame(() => {
      const id2 = window.requestAnimationFrame(() => {
        mapInstanceRef.current?.resize();
      });
      return () => window.cancelAnimationFrame(id2);
    });
    return () => window.cancelAnimationFrame(id1);
  }, [drawerWidthPx, drawerOpen, isTablet]);

  useEffect(() => {
    function onResize() {
      setDrawerWidthPx((w) => clampDrawerWidthPx(w));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

    const handlePinClick = useCallback(
    (point: MediaLocation) => {
      focusOnMedia(point);
      if (mediaPointId) {
        window.history.pushState({}, "", removeQueryParameter("mediaPointId"));
      }
    },
    [focusOnMedia, mediaPointId]
  );

  useEffect(() => {
    if (!mediaPointId) return;
    const point = collectionLocations.find((p) => p.id === mediaPointId);
    if (point) focusOnMedia(point);
  }, [mediaPointId, collectionLocations, focusOnMedia]);
  
  if (collectionId !== prevCollectionId) {
    setPrevCollectionId(collectionId);
    if (collectionId) setDrawerOpen(true);
  }

  const handleMapReady = useCallback(
    (map: mapboxgl.Map) => {
      mapInstanceRef.current = map;
      registerMap(map);
      setIsMapReady(true);
    },
    [registerMap]
  );

  const handleDrawerToggle = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const handleBasemapToggle = useCallback(() => {
    setMapStyle((prev) => (prev === "standard" ? "satellite" : "standard"));
  }, []);

  const handleDrawerWidthChange = useCallback((w: number) => {
    setDrawerWidthPx(clampDrawerWidthPx(w));
  }, []);

  const handleDrawerWidthCommit = useCallback((w: number) => {
    setDrawerWidthPx(clampDrawerWidthPx(w));
  }, []);

  const drawerProps = {
    collections,
    bodyById,
    locationsForSelectedCollection: collectionLocations,
    isOpen: drawerOpen,
    onToggle: handleDrawerToggle,
    drawerWidthPx,
    onDrawerWidthChange: handleDrawerWidthChange,
    onDrawerWidthCommit: handleDrawerWidthCommit,
  };

  return (
    <div className="w-full relative h-[calc(100vh-4rem)]">
      {isTablet ? (
        <div className="relative w-full h-full overflow-hidden">
        <Map
            data={collectionLocations}
            bounds={mapBounds}
            filters={EMPTY_FILTERS}
            styleUrl={STYLES[mapStyle]}
            onMapReady={handleMapReady}
            enableInitialRandomSelection={false}
            highlightedPoint={focusedMedia}
            onPointClick={handlePinClick}
            fitToDataBounds={!!collectionId}
            fitBoundsMaxZoom={10}
          />
          <MapFocusPanel />
          <CollectionsDrawer {...drawerProps} />
          <TooltipProvider>
            <BasemapToggle mapStyle={mapStyle} onToggle={handleBasemapToggle} />
          </TooltipProvider>
        </div>
      ) : (
        
             <div className="w-full h-full overflow-hidden flex">
          {drawerOpen ? <CollectionsDrawer {...drawerProps} /> : null}
          <div className="relative flex-1 min-w-0">
          <Map
            data={collectionLocations}
            bounds={mapBounds}
            filters={EMPTY_FILTERS}
            styleUrl={STYLES[mapStyle]}
            onMapReady={handleMapReady}
            enableInitialRandomSelection={false}
            highlightedPoint={focusedMedia}
            onPointClick={handlePinClick}
            fitToDataBounds={!!collectionId}
            fitBoundsMaxZoom={10}
          />
            <MapFocusPanel />
            <TooltipProvider>
              <BasemapToggle mapStyle={mapStyle} onToggle={handleBasemapToggle} />
            </TooltipProvider>
            {!drawerOpen ? <CollectionsDrawer {...drawerProps} /> : null}
          </div>
        </div>
      
      )}
    </div>
  );
}  
