const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/infrastructure/facilities.geojson', 'utf8'));

console.log('Total facilities after filtering:', data.features.length);
console.log('\nSample facilities:');
data.features.slice(0, 10).forEach((f, i) => {
  const [lng, lat] = f.geometry.coordinates;
  console.log(`${i+1}. ${f.properties.nama} (${f.properties.kategori}) - ${f.properties.nama_kelurahan} - [${lng}, ${lat}]`);
});

// Count by category
const byCategory = {};
data.features.forEach(f => {
  const cat = f.properties.kategori || 'lainnya';
  byCategory[cat] = (byCategory[cat] || 0) + 1;
});

console.log('\nFacilities by category:');
Object.entries(byCategory).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});
