import { GeoJSONCollection } from "@/types/geojson";

// Simple client-side cache
const cache = new Map<string, GeoJSONCollection>();

export async function loadGeoJSON(path: string): Promise<GeoJSONCollection> {
  // Check cache first
  if (cache.has(path)) {
    return cache.get(path)!;
  }

  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load GeoJSON: ${response.statusText}`);
    }
    const data: GeoJSONCollection = await response.json();
    
    // Validate GeoJSON structure
    if (data.type !== "FeatureCollection" || !Array.isArray(data.features)) {
      throw new Error("Invalid GeoJSON structure");
    }

    // Cache the data
    cache.set(path, data);
    return data;
  } catch (error) {
    console.error(`Error loading GeoJSON from ${path}:`, error);
    throw error;
  }
}

export function clearCache(): void {
  cache.clear();
}

export function getCachedGeoJSON(path: string): GeoJSONCollection | null {
  return cache.get(path) || null;
}
