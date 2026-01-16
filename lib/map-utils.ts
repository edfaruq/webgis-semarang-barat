import L from "leaflet";
import { GeoJSONFeature } from "@/types/geojson";

export function getBoundsFromGeoJSON(geojson: GeoJSONFeature[]): L.LatLngBounds | null {
  if (!geojson || geojson.length === 0) return null;

  const bounds = L.latLngBounds([]);
  
  geojson.forEach((feature) => {
    if (feature.geometry.type === "Point") {
      const [lng, lat] = feature.geometry.coordinates as number[];
      bounds.extend([lat, lng]);
    } else if (feature.geometry.type === "Polygon") {
      // Polygon: coordinates is an array of rings, first ring is outer boundary
      const rings = feature.geometry.coordinates as number[][][];
      if (rings && rings.length > 0 && rings[0]) {
        rings[0].forEach((coord) => {
          const [lng, lat] = coord;
          bounds.extend([lat, lng]);
        });
      }
    } else if (feature.geometry.type === "MultiPolygon") {
      // MultiPolygon: array of polygons, each polygon has array of rings
      const multiPolygon = feature.geometry.coordinates as number[][][][];
      multiPolygon.forEach((polygon) => {
        if (polygon && polygon.length > 0 && polygon[0]) {
          polygon[0].forEach((coord) => {
            const [lng, lat] = coord;
            bounds.extend([lat, lng]);
          });
        }
      });
    }
  });

  // Return null if bounds is invalid or empty
  if (!bounds.isValid()) {
    return null;
  }

  return bounds;
}

export function getCenterFromBounds(bounds: L.LatLngBounds): L.LatLngTuple {
  const center = bounds.getCenter();
  return [center.lat, center.lng];
}

// Semarang Barat approximate center
export const SEMARANG_BARAT_CENTER: L.LatLngTuple = [-6.9833, 110.3833];
export const SEMARANG_BARAT_ZOOM = 13;
