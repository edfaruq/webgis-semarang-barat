const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/evacuation/routes/evacuation-route.geojson', 'utf8'));

console.log('Total routes:', data.features.length);
console.log('\nRoutes summary:');
data.features.forEach((f, i) => {
  const p = f.properties;
  console.log(`${i+1}. ${p.nama} - ${p.nama_kelurahan} (${f.geometry.type})`);
});

// Count by kelurahan
const byKelurahan = {};
data.features.forEach(f => {
  const kel = f.properties.nama_kelurahan || 'Unknown';
  byKelurahan[kel] = (byKelurahan[kel] || 0) + 1;
});

console.log('\nRoutes by Kelurahan:');
Object.entries(byKelurahan).forEach(([kel, count]) => {
  console.log(`  ${kel}: ${count} routes`);
});

// Check coordinate format
const firstFeature = data.features[0];
if (firstFeature && firstFeature.geometry.coordinates.length > 0) {
  const firstCoord = firstFeature.geometry.coordinates[0];
  console.log('\nCoordinate format check:');
  console.log(`  First coordinate: [${firstCoord[0]}, ${firstCoord[1]}]`);
  console.log(`  Format: ${firstCoord[0] > 100 ? 'WGS84 (lng, lat)' : 'UTM (needs transform)'}`);
}
