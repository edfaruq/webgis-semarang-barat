const fs = require('fs');
const path = require('path');
const proj4 = require('proj4');

// Define UTM projections
const utm48s = "+proj=utm +zone=48 +south +datum=WGS84 +units=m +no_defs";
const utm49s = "+proj=utm +zone=49 +south +datum=WGS84 +units=m +no_defs";
const wgs84Projection = "+proj=longlat +datum=WGS84 +no_defs";

// Function to transform coordinates from UTM to WGS84
function transformCoordinates(coords, crs) {
  if (!Array.isArray(coords)) return coords;
  
  // Check if it's a coordinate pair [x, y]
  if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    const [x, y] = coords;
    // Use UTM zone 48 or 49 based on CRS
    const utmProjection = (crs && crs.includes('EPSG::32748')) ? utm48s : utm49s;
    const [lng, lat] = proj4(utmProjection, wgs84Projection, [x, y]);
    return [lng, lat];
  }
  
  // Recursively transform nested arrays
  return coords.map(coord => transformCoordinates(coord, crs));
}

// Function to transform geometry
function transformGeometry(geometry, crs) {
  if (!geometry || !geometry.coordinates) return geometry;
  
  return {
    ...geometry,
    coordinates: transformCoordinates(geometry.coordinates, crs)
  };
}

// Function to determine kelurahan from filename
function getKelurahanFromFilename(filename) {
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.includes('kidul')) {
    return {
      kelurahan: 'kalibanteng-kidul',
      slug_kelurahan: 'kalibanteng-kidul',
      nama_kelurahan: 'Kalibanteng Kidul'
    };
  } else if (lowerFilename.includes('kulon')) {
    return {
      kelurahan: 'kalibanteng-kulon',
      slug_kelurahan: 'kalibanteng-kulon',
      nama_kelurahan: 'Kalibanteng Kulon'
    };
  } else if (lowerFilename.includes('ngemplak')) {
    return {
      kelurahan: 'ngemplak-simongan',
      slug_kelurahan: 'ngemplak-simongan',
      nama_kelurahan: 'Ngemplak Simongan'
    };
  } else if (lowerFilename.includes('krobokan')) {
    return {
      kelurahan: 'krobokan',
      slug_kelurahan: 'krobokan',
      nama_kelurahan: 'Krobokan'
    };
  } else if (lowerFilename.includes('tawangmas')) {
    return {
      kelurahan: 'tawangmas',
      slug_kelurahan: 'tawangmas',
      nama_kelurahan: 'Tawangmas'
    };
  } else if (lowerFilename.includes('manyaran')) {
    return {
      kelurahan: 'manyaran',
      slug_kelurahan: 'manyaran',
      nama_kelurahan: 'Manyaran'
    };
  } else if (lowerFilename.includes('bongsari')) {
    return {
      kelurahan: 'bongsari',
      slug_kelurahan: 'bongsari',
      nama_kelurahan: 'Bongsari'
    };
  } else if (lowerFilename.includes('gisikdrono')) {
    return {
      kelurahan: 'gisikdrono',
      slug_kelurahan: 'gisikdrono',
      nama_kelurahan: 'Gisikdrono'
    };
  } else if (lowerFilename.includes('karangayu')) {
    return {
      kelurahan: 'karangayu',
      slug_kelurahan: 'karangayu',
      nama_kelurahan: 'Karangayu'
    };
  }
  return {
    kelurahan: 'unknown',
    slug_kelurahan: 'unknown',
    nama_kelurahan: 'Unknown'
  };
}

// Main function
function mergeEvacuationRoutes() {
  const evacuationRoutesDir = path.join(__dirname, '../public/data/evacuation/routes');
  const files = [
    'jalur-evakuasi-kidul1.geojson',
    'jalur-evakuasi-kidul2.geojson',
    'jalur-evakuasi-kidul3.geojson',
    'jalur-evakuasi-kidul4.geojson',
    'jalur-evakuasi-kulon1.geojson',
    'jalur-evakuasi-ngemplak1.geojson',
    'jalur-evakuasi-ngemplak2.geojson',
    'jalur-evakuasi-ngemplak3.geojson',
    'jalur-evakuasi-ngemplak4.geojson',
    'jalur-evakuasi-ngemplak5.geojson',
    'jalur-evakuasi-tawangmas1.geojson',
    'jalur-evakuasi-krobokan1.geojson',
    'jalur-evakuasi-manyaran1.geojson',
    'jalur-evakuasi-bongsari1.geojson',
    'RUTE-EVAKUASI-LONGSOR-GISIKDRONO.geojson',
    'RUTE-EVAKUASI-BANJIR-GISIKDRONO.geojson',
    'RUTE-EVAKUASI-LONGSOR-KULON.geojson',
    'Rute-Evakuasi-Karangayu.geojson'
  ];

  const allFeatures = [];

  // Function to determine jenis bencana
  function getJenisBencana(kelurahanSlug, geojsonName, featureName) {
    const name = (geojsonName || featureName || '').toLowerCase();
    
    // Untuk kidul, cek dari nama file/GeoJSON
    if (kelurahanSlug === 'kalibanteng-kidul') {
      if (name.includes('banjir')) {
        return 'banjir';
      } else if (name.includes('longsor')) {
        return 'longsor';
      }
      // Default untuk kidul jika tidak jelas
      return 'banjir';
    }
    
    // Untuk kelurahan lain, tentukan berdasarkan slug
    if (['krobokan', 'tawangmas', 'kalibanteng-kulon', 'gisikdrono', 'karangayu'].includes(kelurahanSlug)) {
      // Check if name contains banjir or longsor
      if (name.includes('banjir')) {
        return 'banjir';
      } else if (name.includes('longsor')) {
        return 'longsor';
      }
      // Default untuk kelurahan ini adalah banjir
      return 'banjir';
    }
    
    if (['ngemplak-simongan', 'manyaran', 'bongsari'].includes(kelurahanSlug)) {
      return 'longsor';
    }
    
    return 'banjir'; // default
  }

  files.forEach((filename, index) => {
    const filePath = path.join(evacuationRoutesDir, filename);
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const geojson = JSON.parse(fileContent);
      
      if (geojson.features && Array.isArray(geojson.features)) {
        geojson.features.forEach((feature, featureIndex) => {
          const kelurahanInfo = getKelurahanFromFilename(filename);
          
          // Transform geometry if needed
          let transformedGeometry = feature.geometry;
          const crsName = geojson.crs && geojson.crs.properties ? geojson.crs.properties.name : '';
          if (crsName.includes('EPSG::32749') || crsName.includes('EPSG::32748')) {
            transformedGeometry = transformGeometry(feature.geometry, crsName);
          }
          
          // Determine jenis bencana
          const jenisBencana = getJenisBencana(
            kelurahanInfo.slug_kelurahan,
            geojson.name,
            feature.properties.nama || feature.properties.Name
          );
          
          // Create new feature with proper properties
          const newFeature = {
            type: 'Feature',
            properties: {
              id: `route-${index + 1}-${featureIndex + 1}`,
              nama: feature.properties.nama || geojson.name || `Jalur Evakuasi ${index + 1}`,
              deskripsi: feature.properties.deskripsi || feature.properties.description || `Jalur evakuasi dari ${kelurahanInfo.nama_kelurahan}`,
              prioritas: feature.properties.prioritas || 'sedang',
              kelurahan: kelurahanInfo.kelurahan,
              slug_kelurahan: kelurahanInfo.slug_kelurahan,
              nama_kelurahan: kelurahanInfo.nama_kelurahan,
              jenis_bencana: jenisBencana,
              // Preserve original properties
              ...feature.properties
            },
            geometry: transformedGeometry
          };
          
          allFeatures.push(newFeature);
        });
      }
    } catch (error) {
      console.error(`Error processing ${filename}:`, error.message);
    }
  });

  // Create merged GeoJSON
  const mergedGeoJSON = {
    type: 'FeatureCollection',
    features: allFeatures
  };

  // Write to evacuation-route.geojson
  const outputPath = path.join(evacuationRoutesDir, 'evacuation-route.geojson');
  fs.writeFileSync(outputPath, JSON.stringify(mergedGeoJSON, null, 2));
  
  console.log(`✅ Successfully merged ${allFeatures.length} evacuation routes`);
  console.log(`📁 Saved to: ${outputPath}`);
  
  // Summary
  const byKelurahan = {};
  allFeatures.forEach(f => {
    const kel = f.properties.nama_kelurahan || 'Unknown';
    byKelurahan[kel] = (byKelurahan[kel] || 0) + 1;
  });
  
  console.log('\n📊 Summary by Kelurahan:');
  Object.entries(byKelurahan).forEach(([kel, count]) => {
    console.log(`  ${kel}: ${count} routes`);
  });
}

// Run the script
try {
  mergeEvacuationRoutes();
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
