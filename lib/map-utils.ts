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
      const coordinates = feature.geometry.coordinates[0] as number[][];
      coordinates.forEach((coord) => {
        const [lng, lat] = coord;
        bounds.extend([lat, lng]);
      });
    } else if (feature.geometry.type === "MultiPolygon") {
      const multiPolygon = feature.geometry.coordinates as number[][][];
      multiPolygon.forEach((polygon) => {
        polygon[0].forEach((coord) => {
          const [lng, lat] = coord;
          bounds.extend([lat, lng]);
        });
      });
    }
  });

  return bounds;
}

export function getCenterFromBounds(bounds: L.LatLngBounds): L.LatLngTuple {
  const center = bounds.getCenter();
  return [center.lat, center.lng];
}

// Semarang Barat approximate center
export const SEMARANG_BARAT_CENTER: L.LatLngTuple = [-6.9833, 110.3833];
export const SEMARANG_BARAT_ZOOM = 13;
