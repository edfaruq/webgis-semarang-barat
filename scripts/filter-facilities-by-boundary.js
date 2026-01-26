const fs = require('fs');
const path = require('path');

// Point-in-polygon algorithm (Ray casting algorithm)
function pointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    const intersect = ((yi > y) !== (yj > y)) && 
                     (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
}

// Check if point is inside any of the polygons
function pointInAnyPolygon(point, polygons) {
  for (const polygon of polygons) {
    if (pointInPolygon(point, polygon)) {
      return true;
    }
  }
  return false;
}

// Main function
function filterFacilities() {
  console.log('Loading boundary data...');
  const boundaryPath = path.join(__dirname, '../public/data/infrastructure/boundary.geojson');
  const boundaryData = JSON.parse(fs.readFileSync(boundaryPath, 'utf8'));
  
  console.log('Loading facilities data...');
  const facilitiesPath = path.join(__dirname, '../public/data/infrastructure/facilities.geojson');
  const facilitiesData = JSON.parse(fs.readFileSync(facilitiesPath, 'utf8'));
  
  // Extract all polygons from boundary (all kelurahan in Kecamatan Semarang Barat)
  const polygons = [];
  boundaryData.features.forEach(feature => {
    if (feature.geometry.type === 'Polygon') {
      // Polygon coordinates: [[[lng, lat], [lng, lat], ...]]
      const coords = feature.geometry.coordinates[0]; // First ring is outer boundary
      polygons.push(coords);
    } else if (feature.geometry.type === 'MultiPolygon') {
      // MultiPolygon: [[[[lng, lat], ...]]]
      feature.geometry.coordinates.forEach(polygon => {
        polygons.push(polygon[0]); // First ring of each polygon
      });
    }
  });
  
  console.log(`Found ${polygons.length} boundary polygons from ${boundaryData.features.length} kelurahan`);
  
  // Filter facilities
  const originalCount = facilitiesData.features.length;
  const filteredFeatures = facilitiesData.features.filter(feature => {
    if (feature.geometry.type !== 'Point') {
      return false; // Skip non-point features
    }
    
    const [lng, lat] = feature.geometry.coordinates;
    const point = [lng, lat];
    
    // Check if point is inside any of the boundary polygons
    return pointInAnyPolygon(point, polygons);
  });
  
  const filteredCount = filteredFeatures.length;
  const removedCount = originalCount - filteredCount;
  
  console.log(`\nResults:`);
  console.log(`Original facilities: ${originalCount}`);
  console.log(`Filtered facilities: ${filteredCount}`);
  console.log(`Removed facilities: ${removedCount}`);
  
  // Create new GeoJSON with filtered features
  const filteredData = {
    type: 'FeatureCollection',
    features: filteredFeatures
  };
  
  // Backup original file
  const backupPath = facilitiesPath + '.backup';
  if (!fs.existsSync(backupPath)) {
    console.log('\nCreating backup of original file...');
    fs.copyFileSync(facilitiesPath, backupPath);
    console.log(`Backup saved to: ${backupPath}`);
  }
  
  // Write filtered data
  console.log('\nWriting filtered facilities data...');
  fs.writeFileSync(facilitiesPath, JSON.stringify(filteredData, null, 2));
  console.log(`Filtered data saved to: ${facilitiesPath}`);
  
  console.log('\nDone!');
}

// Run the script
try {
  filterFacilities();
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
