/**
 * Script untuk konversi KML ke GeoJSON
 * 
 * Usage:
 *   node scripts/kml-to-geojson.js input.kml output.geojson [kategori] [kelurahan]
 * 
 * Contoh:
 *   node scripts/kml-to-geojson.js data/fasilitas-kesehatan.kml public/data/infrastructure/facilities.geojson puskesmas manyaran
 */

const fs = require('fs');
const path = require('path');

// Simple KML parser untuk Point features
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
          kategori: 'puskesmas', // default, bisa di-override
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
              
              // Map common KML fields to GeoJSON properties
              if (key === 'namobj' || key.includes('nama') || key.includes('name')) {
                properties.nama = value || properties.nama;
              } else if (key === 'alamat' || key.includes('address')) {
                properties.alamat = value || properties.alamat;
              } else if (key === 'remark') {
                // Use REMARK as additional info or name if name is empty
                if (!properties.nama || properties.nama === 'Unnamed') {
                  properties.nama = value;
                }
              } else if (key.includes('kategori') || key.includes('category')) {
                properties.kategori = value.toLowerCase();
              } else if (key.includes('kelurahan')) {
                properties.kelurahan = value.toLowerCase().replace(/\s+/g, '-');
                properties.nama_kelurahan = value;
              }
            }
          } else {
            // Try regular ExtendedData format (Data/Value)
            const dataRegex = /<Data name="([^"]+)">[\s\S]*?<value>([\s\S]*?)<\/value>/g;
            let dataMatch;
            
            while ((dataMatch = dataRegex.exec(extendedData)) !== null) {
              const key = dataMatch[1].toLowerCase();
              const value = dataMatch[2].trim();
              
              // Map common KML fields to GeoJSON properties
              if (key.includes('nama') || key.includes('name')) {
                properties.nama = value;
              } else if (key.includes('alamat') || key.includes('address')) {
                properties.alamat = value;
              } else if (key.includes('kategori') || key.includes('category')) {
                properties.kategori = value.toLowerCase();
              } else if (key.includes('kelurahan')) {
                properties.kelurahan = value.toLowerCase().replace(/\s+/g, '-');
                properties.nama_kelurahan = value;
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

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node kml-to-geojson.js <input.kml> <output.geojson> [kategori] [kelurahan]');
    console.error('');
    console.error('Contoh:');
    console.error('  node scripts/kml-to-geojson.js data/fasilitas-kesehatan.kml public/data/infrastructure/facilities.geojson puskesmas manyaran');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputFile = args[1];
  const kategori = args[2] || 'puskesmas';
  const kelurahan = args[3] || '';
  
  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(`Error: File tidak ditemukan: ${inputFile}`);
    process.exit(1);
  }
  
  // Read KML file
  console.log(`Reading KML file: ${inputFile}`);
  const kmlContent = fs.readFileSync(inputFile, 'utf-8');
  
  // Parse KML
  console.log('Parsing KML...');
  const geoJson = parseKML(kmlContent);
  
  // Apply kategori and kelurahan if provided
  if (kategori || kelurahan) {
    geoJson.features.forEach(feature => {
      if (kategori) {
        feature.properties.kategori = kategori;
      }
      if (kelurahan) {
        feature.properties.kelurahan = kelurahan.toLowerCase().replace(/\s+/g, '-');
        feature.properties.nama_kelurahan = kelurahan;
      }
    });
  }
  
  console.log(`Found ${geoJson.features.length} features`);
  
  // Check if output file exists (for merging)
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
  
  // Merge or create new
  if (existingGeoJson && existingGeoJson.type === 'FeatureCollection') {
    console.log('Merging with existing features...');
    // Remove duplicates based on coordinates and name
    const existingCoords = new Set();
    existingGeoJson.features.forEach(f => {
      if (f.geometry.type === 'Point') {
        const key = `${f.geometry.coordinates[0]},${f.geometry.coordinates[1]}`;
        existingCoords.add(key);
      }
    });
    
    // Add new features that don't exist
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
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write GeoJSON
  console.log(`Writing GeoJSON to: ${outputFile}`);
  fs.writeFileSync(outputFile, JSON.stringify(geoJson, null, 2), 'utf-8');
  
  console.log('✅ Conversion completed successfully!');
  console.log(`   Output: ${outputFile}`);
  console.log(`   Features: ${geoJson.features.length}`);
}

// Run
main();
