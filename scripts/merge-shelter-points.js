const fs = require('fs');
const path = require('path');
const proj4 = require('proj4');

// Define coordinate systems
const utm48s = '+proj=utm +zone=48 +south +ellps=WGS84 +datum=WGS84 +units=m +no_defs';
const utm49s = '+proj=utm +zone=49 +south +ellps=WGS84 +datum=WGS84 +units=m +no_defs';
const wgs84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

// Transform geometry from UTM to WGS84
function transformPoint(coordinates, crs) {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return coordinates;
  }
  
  const [x, y] = coordinates;
  // Use UTM zone 48 or 49 based on CRS
  const utm = (crs && crs.includes('EPSG::32748')) ? utm48s : utm49s;
  const [lng, lat] = proj4(utm, wgs84, [x, y]);
  return [lng, lat];
}

// Get kelurahan info from filename
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

function mergeShelterPoints() {
  const shelterDir = path.join(__dirname, '..', 'public', 'data', 'evacuation', 'shelter');
  const files = [
    'titik-kumpul-kidul.geojson',
    'titik-kumpul-kidul2.geojson',
    'titik-kumpul-kulon.geojson',
    'titik-kumpul-ngemplak.geojson',
    'titik-kumpul-krobokan.geojson',
    'titik-kumpul-tawangmas.geojson',
    'titik-kumpul-manyaran.geojson',
    'titik-kumpul-bongsari.geojson',
    'TITIK-KUMPUL-BANJIR-GISIKDRONO.geojson',
    'TITIK-KUMPUL-LONGSOR-KULON.geojson',
    'TITIK-KUMPUL-LONGSOR-GISIKDRONO.geojson',
    'Titik-Evakuasi-Karangayu.geojson'
  ];
  
  const allFeatures = [];
  
  files.forEach((filename, fileIndex) => {
    const filePath = path.join(shelterDir, filename);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filename}`);
      return;
    }
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const geojson = JSON.parse(fileContent);
      
      if (geojson.features && Array.isArray(geojson.features)) {
        const kelurahanInfo = getKelurahanFromFilename(filename);
        
        geojson.features.forEach((feature, featureIndex) => {
          // Handle both Point and MultiPoint geometries
          let coordinates = null;
          let geometryType = feature.geometry.type;
          
          if (geometryType === 'Point') {
            coordinates = feature.geometry.coordinates;
          } else if (geometryType === 'MultiPoint') {
            // MultiPoint: take first point
            if (feature.geometry.coordinates && feature.geometry.coordinates.length > 0) {
              coordinates = feature.geometry.coordinates[0];
            } else {
              console.warn(`⚠️  Skipping MultiPoint feature with no coordinates in ${filename}`);
              return;
            }
          } else {
            console.warn(`⚠️  Skipping non-Point/MultiPoint feature (${geometryType}) in ${filename}`);
            return;
          }
          
          // Transform coordinates if needed
          let transformedCoordinates = coordinates;
          // Check if CRS is UTM (EPSG:32749 or EPSG:32748) or if coordinates look like UTM (large numbers)
          const crsName = geojson.crs && geojson.crs.properties ? geojson.crs.properties.name : '';
          const isUTM49 = crsName.includes('EPSG::32749');
          const isUTM48 = crsName.includes('EPSG::32748');
          const looksLikeUTM = coordinates && coordinates.length >= 2 && Math.abs(coordinates[0]) > 1000 && Math.abs(coordinates[1]) > 1000;
          
          if (isUTM49 || isUTM48 || (looksLikeUTM && !geojson.crs)) {
            transformedCoordinates = transformPoint(coordinates, crsName);
          }
          
          // Extract nama from properties (handle different property names)
          const props = feature.properties || {};
          const nama = props.Nama || props.Name || props.nama || `Titik Kumpul ${fileIndex + 1}-${featureIndex + 1}`;
          
          // Create new feature with standardized properties
          const newFeature = {
            type: 'Feature',
            properties: {
              id: `shelter-${fileIndex + 1}-${featureIndex + 1}`,
              nama: nama,
              kelurahan: kelurahanInfo.kelurahan,
              slug_kelurahan: kelurahanInfo.slug_kelurahan,
              nama_kelurahan: kelurahanInfo.nama_kelurahan,
              // Preserve original properties
              ...props
            },
            geometry: {
              type: 'Point',
              coordinates: transformedCoordinates.length > 2 ? transformedCoordinates.slice(0, 2) : transformedCoordinates
            }
          };
          
          allFeatures.push(newFeature);
        });
      }
    } catch (error) {
      console.error(`❌ Error processing ${filename}:`, error.message);
    }
  });
  
  // Create merged GeoJSON
  const mergedGeoJSON = {
    type: 'FeatureCollection',
    features: allFeatures
  };
  
  // Write to titik-kumpul.geojson
  const outputPath = path.join(shelterDir, 'titik-kumpul.geojson');
  fs.writeFileSync(outputPath, JSON.stringify(mergedGeoJSON, null, 2));
  
  console.log(`✅ Successfully merged ${allFeatures.length} shelter points`);
  console.log(`📁 Output: ${outputPath}`);
  
  // Summary by kelurahan
  const summary = {};
  allFeatures.forEach(f => {
    const kel = f.properties.nama_kelurahan;
    summary[kel] = (summary[kel] || 0) + 1;
  });
  
  console.log('\n📊 Summary by kelurahan:');
  Object.entries(summary).forEach(([kel, count]) => {
    console.log(`   ${kel}: ${count} points`);
  });
}

// Run the merge
mergeShelterPoints();
