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
import { computeMapBounds } from "@/lib/utils";
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

export default function CollectionsContainer({
  collections,
  allMediaPoints,
  bodyById,
}: CollectionsContainerProps) {
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
  const { registerMap, clearFocus } = useCollectionMap();

  useLayoutEffect(() => {
    setDrawerWidthPx(clampDrawerWidthPx(defaultCollectionsDrawerWidthPx()));
  }, []);

  const selectedCollection = collectionId
    ? collections.find((c) => c.id === collectionId)
    : null;

  const collectionLocations = useMemo(() => {
    if (!selectedCollection) return [];
    return resolveLocationsForCollection(selectedCollection, allMediaPoints);
  }, [selectedCollection, allMediaPoints]);

  // Same bounds as the full catalog so the globe zoom matches the map view.
  const mapBounds = useMemo(() => computeMapBounds(allMediaPoints), [allMediaPoints]);

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

    useEffect(() => {
    const mapInstance = mapInstanceRef.current;
    if (!isMapReady || !mapInstance || !collectionId || collectionLocations.length === 0) {
      return;
    }
    if (mediaPointId) return;

    const first = collectionLocations[0];
    mapInstance.flyTo({
      center: [first.longitude, first.latitude],
      duration: 800,
    });
  }, [isMapReady, collectionId, collectionLocations, mediaPointId]);

    useEffect(() => {
    if (mediaPointId) clearFocus();
  }, [mediaPointId, clearFocus]);
  
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
    <CollectionMapProvider collectionLocations={collectionLocations}>
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
    </CollectionMapProvider>
  ); // end of return
}  
