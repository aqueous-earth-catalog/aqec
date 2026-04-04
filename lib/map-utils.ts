/**
 * Shared utilities for Mapbox map operations.
 * Pure functions that operate on a Mapbox map instance —
 */

import { GeoJSONSource, LngLatBoundsLike } from "mapbox-gl";
import { MediaLocation } from "@/lib/airtable/types";
import { addQueryParameter } from "@/lib/utils";

export const STYLES = {
  standard: "mapbox://styles/mapbox/standard",
  satellite: "mapbox://styles/mapbox/standard-satellite",
} as const;

export type MapStyle = keyof typeof STYLES;

/** Fallback bounds when the dataset is empty or has a single point. */
export const DEFAULT_BOUNDS = [
  [-63.34638, 14.18116],
  [69.37245, 63.28781],
] as LngLatBoundsLike;

export const DEFAULT_ZOOM = 5;

/** Export the current map canvas as a downloadable PNG. */
export function takeScreenshot(mapInstance: mapboxgl.Map) {
  const canvas = mapInstance.getCanvas();
  const dataURL = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataURL;
  const timestamp = new Date().toISOString().split("T")[0];
  link.download = `map-screenshot-${timestamp}.png`;
  link.click();
}

/**
 * Set up keyboard navigation and accessibility attributes on the map container.
 * Returns a cleanup function that removes the event listener.
 */
export function setupKeyboardNav(
  container: HTMLElement,
  mapInstance: mapboxgl.Map
): () => void {
  container.setAttribute("tabindex", "0");
  container.setAttribute("role", "application");
  container.setAttribute(
    "aria-label",
    "Interactive map showing media locations. Use arrow keys to navigate, plus/minus to zoom."
  );

  const handleKeyDown = (e: KeyboardEvent) => {
    // Dynamic step size based on zoom level
    const zoom = mapInstance.getZoom();
    let step = 4;

    if (zoom >= 7 && zoom < 10) {
      step = 1;
    } else if (zoom >= 10 && zoom < 12) {
      step = 0.1;
    } else if (zoom >= 12) {
      step = 0.01;
    }

    const center = mapInstance.getCenter();

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        mapInstance.panTo([center.lng, center.lat + step]);
        break;
      case "ArrowDown":
        e.preventDefault();
        mapInstance.panTo([center.lng, center.lat - step]);
        break;
      case "ArrowLeft":
        e.preventDefault();
        mapInstance.panTo([center.lng - step, center.lat]);
        break;
      case "ArrowRight":
        e.preventDefault();
        mapInstance.panTo([center.lng + step, center.lat]);
        break;
      case "+":
      case "=":
        e.preventDefault();
        mapInstance.zoomIn();
        break;
      case "-":
        e.preventDefault();
        mapInstance.zoomOut();
        break;
    }
  };

  container.addEventListener("keydown", handleKeyDown);
  return () => container.removeEventListener("keydown", handleKeyDown);
}

/**
 * Add or update the media-points GeoJSON source and circle layer.
 *
 * If the source already exists, its data is replaced in-place via setData().
 * The optional `selected` parameter sets a `selected` property on the
 * matching feature so that paint expressions can highlight it. Including
 * selection in the same setData() call avoids an intermediate render frame
 * where points flash with default (black) styling.
 *
 * Click and hover interactions are registered on the layer so that
 * selecting a point updates the URL and the cursor changes on hover.
 */
export function addDataLayer(
  mapInstance: mapboxgl.Map,
  data: MediaLocation[],
  selected?: MediaLocation | null
) {
  const geojson = {
    type: "FeatureCollection",
    features: data.map((point) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [point.longitude, point.latitude],
      },
      properties: {
        ...point,
        selected: point.id === selected?.id,
      },
    })),
  };

  const existingSource = mapInstance.getSource("media-points");

  if (existingSource) {
    (existingSource as GeoJSONSource).setData(
      geojson as GeoJSON.FeatureCollection
    );
  } else {
    mapInstance.addSource("media-points", {
      type: "geojson",
      data: geojson as GeoJSON.FeatureCollection,
    });
  }

  const existingLayer = mapInstance.getLayer("media-points-layer");

  if (!existingLayer) {
    mapInstance.addLayer({
      id: "media-points-layer",
      type: "circle",
      source: "media-points",
      layout: {
        "circle-sort-key": ["case", ["get", "selected"], 1, 0],
      },
      paint: {
        "circle-radius": ["case", ["get", "selected"], 12, 8],
        "circle-color": ["case", ["get", "selected"], "#15cc09", "#4264fb"],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });

    mapInstance.on("click", "media-points-layer", (e) => {
      if (!e.features || e.features.length === 0) return;

      const feature = e.features[0];
      const props = feature.properties;

      if (props && props.id) {
        const params = addQueryParameter("mediaPointId", props.id);
        window.history.pushState({}, "", params);
      }
    });

    mapInstance.on("mouseenter", "media-points-layer", () => {
      mapInstance.getCanvas().style.cursor = "pointer";
    });

    mapInstance.on("mouseleave", "media-points-layer", () => {
      mapInstance.getCanvas().style.cursor = "";
    });
  }
}