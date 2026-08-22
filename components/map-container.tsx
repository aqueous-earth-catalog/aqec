"use client";

import { MapFilters, MediaLocation } from "@/lib/airtable/types";
import { ENABLE_REGION_FILTER } from "@/lib/feature-flags";
import { cn, computeMapBounds } from "@/lib/utils";
import { collectMatchingMedia, matchesSearch } from "@/lib/search";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Map } from "@/components/map";
import { STYLES, MapStyle, takeScreenshot, DEFAULT_ZOOM } from "@/lib/map-utils";
import { MapDrawer } from "./map-drawer";
import { MapToolbar } from "./map-toolbar";
import { BasemapToggle } from "./basemap-toggle";
import { useIsTablet } from "./hooks/use-tablet";
import { TooltipProvider } from "./ui/tooltip";

interface MapContainerProps {
  mediaPoints: MediaLocation[];
}

const MIN_DRAWER_WIDTH_PX = 280;
/** Matches previous `w-80` / `w-96` split at Tailwind’s default `lg` (1024px). */
const LG_BREAKPOINT_PX = 1024;
const DEFAULT_DRAWER_WIDTH_NARROW_PX = 320;
const DEFAULT_DRAWER_WIDTH_WIDE_PX = 384;

function defaultDrawerWidthForViewport(): number {
  if (typeof window === "undefined") return DEFAULT_DRAWER_WIDTH_WIDE_PX;
  return Math.floor(window.innerWidth * 0.4);
}

function maxDrawerWidthPx(): number {
  if (typeof window === "undefined") return DEFAULT_DRAWER_WIDTH_WIDE_PX * 2;
  return Math.floor(window.innerWidth * 0.5);
}

function clampDrawerWidthPx(w: number) {
  const max = maxDrawerWidthPx();
  return Math.min(max, Math.max(MIN_DRAWER_WIDTH_PX, Math.round(w)));
}

/*
Map Container component Reason:
Filtering is handled client-side to provide instant feedback to the user,
avoid unnecessary server requests and page redirects, and keep the map UI
responsive while users refine search and filter criteria.
*/

export default function MapContainer({ mediaPoints }: MapContainerProps) {
  const searchParams = useSearchParams();
  const mediaPointId = searchParams.get("mediaPointId");
  const mediaId = searchParams.get("mediaId");
  const [prevMediaPointId, setPrevMediaPointId] = useState(mediaPointId);
  const [prevMediaId, setPrevMediaId] = useState(mediaId);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [mapStyle, setMapStyle] = useState<MapStyle>("standard");
  const [searchValue, setSearchValue] = useState("");
  // 0 = no measured width yet; drawer renders CSS 40vw until the layout effect runs.
  const [drawerWidthPx, setDrawerWidthPx] = useState(0);

  useLayoutEffect(() => {
    setDrawerWidthPx(clampDrawerWidthPx(defaultDrawerWidthForViewport()));
  }, []);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const isTablet = useIsTablet();

  // When the drawer width changes (desktop), the map container width changes too.
  // Mapbox needs an explicit resize() so the map recenters in the available area
  // without changing zoom/orientation.
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

  const handleDrawerWidthChange = useCallback((w: number) => {
    setDrawerWidthPx(clampDrawerWidthPx(w));
  }, []);

  const handleDrawerWidthCommit = useCallback((w: number) => {
    setDrawerWidthPx(clampDrawerWidthPx(w));
  }, []);

  const handleMapReady = useCallback((mapInstance: mapboxgl.Map) => {
    mapInstanceRef.current = mapInstance;
  }, []);

  const handleScreenshot = useCallback(() => {
    if (mapInstanceRef.current) takeScreenshot(mapInstanceRef.current);
  }, []);

  const handleDrawerToggle = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const handleBasemapToggle = useCallback(() => {
    setMapStyle((prev) => (prev === "standard" ? "satellite" : "standard"));
  }, []);

  // This block checks if the selected mediaPointId from the URL search parameters has changed.
  // If it detects a change, it updates the state storing the previous mediaPointId.
  // Additionally, if a new mediaPointId is present, it ensures the map drawer is open,
  if (mediaPointId !== prevMediaPointId) {
    setPrevMediaPointId(mediaPointId);
    if (mediaPointId) {
      setDrawerOpen(true);
    }
  }
  if (mediaId !== prevMediaId) {
    setPrevMediaId(mediaId);
    if (mediaId) {
      setDrawerOpen(true);
    }
  }

  const filters: MapFilters = useMemo(
    () => ({
      countries: searchParams.get("country")?.split(",").filter(Boolean) || [],
      regions: ENABLE_REGION_FILTER
        ? searchParams.get("region")?.split(",").filter(Boolean) || []
        : [],
      bodiesOfWater:
        searchParams.get("body_of_water")?.split(",").filter(Boolean) || [],
      startYear: searchParams.get("start_year") || "",
      endYear: searchParams.get("end_year") || "",
    }),
    [searchParams]
  );

  const filteredMediaPoints = useMemo(() => {
    return mediaPoints.filter((media) => {
      if (
        filters.countries.length > 0 &&
        !filters.countries.includes(media?.country?.toLowerCase() || "")
      )
        return false;
      if (
        ENABLE_REGION_FILTER &&
        filters.regions.length > 0 &&
        !filters.regions.includes(media?.region?.toLowerCase() || "")
      )
        return false;
      if (
        filters.bodiesOfWater.length > 0 &&
        !filters.bodiesOfWater.includes(
          media.natural_feature_name?.toLowerCase() || ""
        )
      )
        return false;
      if (
        filters.startYear &&
        media.media?.release_year &&
        media.media?.release_year < +filters.startYear
      )
        return false;
      if (
        filters.endYear &&
        media.media?.release_year &&
        media.media?.release_year > +filters.endYear
      )
        return false;

      return true;
    });
  }, [filters, mediaPoints]);

  const searchedMediaPoints = useMemo(() => {
    return filteredMediaPoints.filter((media) =>
      matchesSearch(media, searchValue)
    );
  }, [searchValue, filteredMediaPoints]);

  const searchedMediaResults = useMemo(
    () => collectMatchingMedia(filteredMediaPoints, searchValue),
    [filteredMediaPoints, searchValue]
  );

  const selectedMediaLocations = useMemo(() => {
    if (!mediaId) return [];
    return mediaPoints.filter((point) => point.media_id === mediaId);
  }, [mediaPoints, mediaId]);

  const mapData = mediaId ? selectedMediaLocations : searchedMediaPoints;

  // Bounds are computed from filter results only (not search),
  // so the map doesn't refit on every keystroke.
  // When a Media result is selected, fit to that film's related locations.
  const mapBounds = useMemo(
    () =>
      computeMapBounds(mediaId ? selectedMediaLocations : filteredMediaPoints),
    [filteredMediaPoints, mediaId, selectedMediaLocations]
  );

  const drawerProps = {
    searchedMediaPoints,
    searchedMediaResults,
    allMediaPoints: mediaPoints,
    searchValue,
    onSearchChange: setSearchValue,
    isOpen: drawerOpen,
    onToggle: handleDrawerToggle,
    drawerWidthPx,
    onDrawerWidthChange: handleDrawerWidthChange,
    onDrawerWidthCommit: handleDrawerWidthCommit,
  };

  return (
<div className="w-full relative h-full min-h-0 overflow-hidden">
  {isTablet ? (
        // Mobile/tablet: map full-bleed with overlay bottom-sheet drawer
        <div className="relative w-full h-full overflow-hidden">
          <Map
            data={mapData}
            bounds={mapBounds}
            filters={filters}
            styleUrl={STYLES[mapStyle]}
            onMapReady={handleMapReady}
            fitToDataBounds={!!mediaId}
            fitBoundsMaxZoom={DEFAULT_ZOOM}
            fitBoundsDuration={mediaId ? 1000 : 0}
            enableInitialRandomSelection={!mediaId}
          />
          <MapDrawer {...drawerProps} />
          <TooltipProvider>
            <div
              className={cn(
                "absolute top-3 z-20 max-sm:left-3 sm:left-1/2 sm:-translate-x-1/2"
              )}
            >
              <MapToolbar
                filters={filters}
                mediaPoints={mediaPoints}
                onScreenshot={handleScreenshot}
              />
            </div>
            <BasemapToggle mapStyle={mapStyle} onToggle={handleBasemapToggle} />
          </TooltipProvider>
        </div>
      ) : (
        // Desktop: true split view so the map stays fully visible
        <div className="w-full h-full overflow-hidden flex">
          {drawerOpen ? (
            <MapDrawer {...drawerProps} />
          ) : null}
          <div className="relative flex-1 min-w-0">
            <Map
              data={mapData}
              bounds={mapBounds}
              filters={filters}
              styleUrl={STYLES[mapStyle]}
              onMapReady={handleMapReady}
              fitToDataBounds={!!mediaId}
              fitBoundsMaxZoom={DEFAULT_ZOOM}
              fitBoundsDuration={mediaId ? 1000 : 0}
              enableInitialRandomSelection={!mediaId}
            />
            <TooltipProvider>
              <div className="absolute top-3 z-20 left-1/2 -translate-x-1/2">
                <MapToolbar
                  filters={filters}
                  mediaPoints={mediaPoints}
                  onScreenshot={handleScreenshot}
                />
              </div>
              <BasemapToggle
                mapStyle={mapStyle}
                onToggle={handleBasemapToggle}
              />
            </TooltipProvider>

            {/* When closed, render the open button overlaying the map. */}
            {!drawerOpen ? (
              <MapDrawer {...drawerProps} />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
