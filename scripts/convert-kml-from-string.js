/**
 * Script untuk convert KML dari string langsung
 * Usage: node scripts/convert-kml-from-string.js
 * 
 * Script ini akan membaca KML dari file yang sudah ada atau dari stdin
 */

const fs = require('fs');
const path = require('path');

// Import parseKML function dari kml-to-geojson.js
function parseKML(kmlContent) {
  const features = [];
  
  // Extract Placemark elements
  const placemarkRegex = /<Placemark[^>]*>([\s\S]*?)<\/Placemark>/g;
  let placemarkMatch;
  
  while ((placemarkMatch = placemarkRegex.exec(kmlContent)) !== null) {
    const placemarkContent = placemarkMatch[1];
    
    // Extract name
    const nameMatch = placemarkContent.match(/<name[^>]*>([\s\S]*?)<\/name>/);
    const name = nameMatch ? nameMatch[1].trim() : 'Unnamed';
    
    // Extract description
    const descMatch = placemarkContent.match(/<description[^>]*>([\s\S]*?)<\/description>/);
    const description = descMatch ? descMatch[1].trim() : '';
    
    // Extract coordinates (Point)
    const pointMatch = placemarkContent.match(/<Point[^>]*>[\s\S]*?<coordinates[^>]*>([\s\S]*?)<\/coordinates>/);
    if (pointMatch) {
      const coordsStr = pointMatch[1].trim();
      const coords = coordsStr.split(',').map(c => parseFloat(c.trim()));
      
      if (coords.length >= 2) {
        const [lng, lat] = coords;
        
        // Extract ExtendedData if exists
        const extendedDataMatch = placemarkContent.match(/<ExtendedData[^>]*>([\s\S]*?)<\/ExtendedData>/);
        const properties = {
          nama: name,
          kategori: 'sekolah',
          alamat: description || '',
        };
        
        if (extendedDataMatch) {
          const extendedData = extendedDataMatch[1];
          
          // Try SchemaData format (SimpleData)
          const schemaDataMatch = extendedData.match(/<SchemaData[^>]*>([\s\S]*?)<\/SchemaData>/);
          if (schemaDataMatch) {
            const schemaData = schemaDataMatch[1];
            const simpleDataRegex = /<SimpleData name="([^"]+)">([\s\S]*?)<\/SimpleData>/g;
            let simpleDataMatch;
            
            while ((simpleDataMatch = simpleDataRegex.exec(schemaData)) !== null) {
              const key = simpleDataMatch[1].toLowerCase();
              const value = simpleDataMatch[2].trim();
              
              if (key === 'namobj' || key.includes('nama') || key.includes('name')) {
                properties.nama = value || properties.nama;
              } else if (key === 'alamat' || key.includes('address')) {
                properties.alamat = value || properties.alamat;
              } else if (key === 'remark') {
                if (!properties.nama || properties.nama === 'Unnamed') {
                  properties.nama = value;
                }
              }
            }
          }
        }
        
        features.push({
          type: 'Feature',
          properties,
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          }
        });
      }
    }
  }
  
  return {
    type: 'FeatureCollection',
    features
  };
}

// Main
const args = process.argv.slice(2);
const inputFile = args[0] || 'scripts/fasilitas-pendidikan-full.kml';
const outputFile = args[1] || 'public/data/infrastructure/facilities.geojson';
const kategori = args[2] || 'sekolah';

if (!fs.existsSync(inputFile)) {
  console.error(`Error: File tidak ditemukan: ${inputFile}`);
  process.exit(1);
}

console.log(`Reading KML file: ${inputFile}`);
const kmlContent = fs.readFileSync(inputFile, 'utf-8');

console.log('Parsing KML...');
const geoJson = parseKML(kmlContent);

geoJson.features.forEach(feature => {
  feature.properties.kategori = kategori;
});

console.log(`Found ${geoJson.features.length} features`);

// Merge with existing
let existingGeoJson = null;
if (fs.existsSync(outputFile)) {
  console.log(`Output file exists, reading existing data...`);
  const existingContent = fs.readFileSync(outputFile, 'utf-8');
  try {
    existingGeoJson = JSON.parse(existingContent);
    console.log(`Found ${existingGeoJson.features.length} existing features`);
  } catch (e) {
    console.warn('Warning: Could not parse existing GeoJSON, will overwrite');
  }
}

if (existingGeoJson && existingGeoJson.type === 'FeatureCollection') {
  console.log('Merging with existing features...');
  const existingCoords = new Set();
  existingGeoJson.features.forEach(f => {
    if (f.geometry.type === 'Point') {
      const key = `${f.geometry.coordinates[0]},${f.geometry.coordinates[1]}`;
      existingCoords.add(key);
    }
  });
  
  geoJson.features.forEach(f => {
    if (f.geometry.type === 'Point') {
      const key = `${f.geometry.coordinates[0]},${f.geometry.coordinates[1]}`;
      if (!existingCoords.has(key)) {
        existingGeoJson.features.push(f);
      }
    }
  });
  
  geoJson.features = existingGeoJson.features;
  console.log(`Total features after merge: ${geoJson.features.length}`);
}

const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`Writing GeoJSON to: ${outputFile}`);
fs.writeFileSync(outputFile, JSON.stringify(geoJson, null, 2), 'utf-8');

console.log('✅ Conversion completed successfully!');
console.log(`   Output: ${outputFile}`);
console.log(`   Features: ${geoJson.features.length}`);
