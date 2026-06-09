"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import mapboxgl, { LngLatBoundsLike } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapFilters, MediaLocation } from "@/lib/airtable/types";
import { addQueryParameter, hasActiveFilters } from "@/lib/utils";
import {
  addDataLayer,
  setupKeyboardNav,
} from "@/lib/map-utils";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
/** Globe size for full-catalog view. Higher = globe looks larger. */
const MAP_CATALOG_ZOOM = 2.5;

interface MapProps {
  data: MediaLocation[];
  bounds: LngLatBoundsLike | undefined;
  filters: MapFilters;
  styleUrl: string;
  onMapReady?: (mapInstance: mapboxgl.Map) => void;
  enableInitialRandomSelection?: boolean;
  /** Scroll/panel focus — green pin without URL (collections). */
  highlightedPoint?: MediaLocation | null;
  /** Collections: pin click opens panel instead of URL. */
  onPointClick?: (point: MediaLocation) => void;
  /** Collections: stay fitted to bounds instead of globe zoom. */
  fitToDataBounds?: boolean;
  fitBoundsMaxZoom?: number;
}

export function Map({
  data,
  bounds,
  filters,
  styleUrl,
  onMapReady,
  enableInitialRandomSelection = true,
  highlightedPoint = null,
  onPointClick,
  fitToDataBounds = false,
  fitBoundsMaxZoom = 10,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const searchParams = useSearchParams();
  const mediaPointId = searchParams.get("mediaPointId");
  const onPointClickRef = useRef(onPointClick);
  onPointClickRef.current = onPointClick;

  const selectedMediaPoint = mediaPointId
    ? data.find((point) => point.id === mediaPointId)
    : null;

  const effectiveSelected = selectedMediaPoint ?? highlightedPoint ?? null;

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [0, 20],
      zoom: MAP_CATALOG_ZOOM,
      preserveDrawingBuffer: true,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      setIsMapLoaded(true);
      if (map.current) onMapReady?.(map.current);
    });

    const container = mapContainer.current;
    const cleanupKeyboard = container
      ? setupKeyboardNav(container, map.current)
      : undefined;

    return () => {
      cleanupKeyboard?.();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevStyleRef = useRef(styleUrl);
  useEffect(() => {
    if (!map.current || !isMapLoaded || styleUrl === prevStyleRef.current)
      return;
    prevStyleRef.current = styleUrl;
    map.current.setStyle(styleUrl);
    map.current.once("style.load", () => {
      if (map.current) {
        addDataLayer(
          map.current,
          data,
          effectiveSelected,
          onPointClick
            ? { onPointClick: (point) => onPointClickRef.current?.(point) }
            : undefined
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleUrl, isMapLoaded]);

  useEffect(() => {
    if (!map.current || !isMapLoaded || !bounds) return;

    map.current.fitBounds(bounds, {
      duration: 0,
      maxZoom: fitBoundsMaxZoom,
      padding: 48,
    });

    if (!fitToDataBounds) {
      map.current.setZoom(MAP_CATALOG_ZOOM);
    }
  }, [isMapLoaded, bounds, fitToDataBounds, fitBoundsMaxZoom]);

  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

        addDataLayer(
          map.current,
          data,
          effectiveSelected,
          onPointClick
            ? { onPointClick: (point) => onPointClickRef.current?.(point) }
            : undefined
        );

    if (selectedMediaPoint && !onPointClickRef.current) {
      map.current.flyTo({
        center: [
          selectedMediaPoint.longitude,
          selectedMediaPoint.latitude,
        ],
      });
    }
  }, [isMapLoaded, data, effectiveSelected, selectedMediaPoint]);

  useEffect(() => {
    if (
      enableInitialRandomSelection === false ||
      selectedMediaPoint ||
      !isMapLoaded ||
      data.length === 0 ||
      hasActiveFilters(filters)
    ) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * data.length);
    window.history.pushState(
      {},
      "",
      addQueryParameter("mediaPointId", data[randomIndex].id)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapLoaded]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    />
  );
}
