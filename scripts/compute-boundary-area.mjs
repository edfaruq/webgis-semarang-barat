import fs from "node:fs/promises";
import path from "node:path";

// Compute geodesic polygon area on a sphere (WGS84-ish) using a spherical excess approximation.
// Input ring: array of [lng, lat] in degrees. Output: area in square meters (always positive).
const R = 6378137; // meters (WGS84 semi-major, close enough for this use)

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function ringAreaSqMeters(ring) {
  if (!Array.isArray(ring) || ring.length < 4) return 0;

  // Ensure ring is closed
  const first = ring[0];
  const last = ring[ring.length - 1];
  const isClosed = first[0] === last[0] && first[1] === last[1];
  const pts = isClosed ? ring : [...ring, first];

  // Chamberlain & Duquette-like approach on a sphere
  let sum = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [lon1, lat1] = pts[i];
    const [lon2, lat2] = pts[i + 1];

    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const lam1 = toRad(lon1);
    const lam2 = toRad(lon2);

    sum += (lam2 - lam1) * (2 + Math.sin(phi1) + Math.sin(phi2));
  }

  const area = (sum * R * R) / 2;
  return Math.abs(area);
}

function polygonAreaSqMeters(coords) {
  // GeoJSON Polygon coordinates: [ outerRing, hole1, hole2, ... ]
  if (!Array.isArray(coords) || coords.length === 0) return 0;
  const outer = ringAreaSqMeters(coords[0]);
  let holes = 0;
  for (let i = 1; i < coords.length; i++) holes += ringAreaSqMeters(coords[i]);
  return Math.max(0, outer - holes);
}

function multiPolygonAreaSqMeters(coords) {
  if (!Array.isArray(coords)) return 0;
  return coords.reduce((acc, poly) => acc + polygonAreaSqMeters(poly), 0);
}

function featureAreaSqMeters(feature) {
  if (!feature?.geometry) return null;
  const { type, coordinates } = feature.geometry;
  if (type === "Polygon") return polygonAreaSqMeters(coordinates);
  if (type === "MultiPolygon") return multiPolygonAreaSqMeters(coordinates);
  return null;
}

const repoRoot = process.cwd();
const target = path.join(repoRoot, "public", "data", "infrastructure", "boundary.geojson");

const raw = await fs.readFile(target, "utf8");
const data = JSON.parse(raw);

if (data?.type !== "FeatureCollection" || !Array.isArray(data.features)) {
  throw new Error("Invalid GeoJSON FeatureCollection");
}

const updated = [];
for (const f of data.features) {
  const slug = f?.properties?.slug ?? f?.properties?.id ?? "unknown";
  const area = featureAreaSqMeters(f);
  if (area == null) continue;

  const areaInt = Math.round(area); // match existing format (integer m²)
  const prev = f.properties?.luas;

  // Update only when luas is null/missing/0 (0 indicates previously-invalid geometry)
  if (prev === null || typeof prev === "undefined" || prev === 0) {
    f.properties = { ...f.properties, luas: areaInt };
    updated.push({ slug, luas: areaInt });
  }
}

await fs.writeFile(target, JSON.stringify(data, null, 2) + "\n", "utf8");

console.log("Updated luas for", updated.length, "features:");
for (const row of updated) console.log("-", row.slug, row.luas);
