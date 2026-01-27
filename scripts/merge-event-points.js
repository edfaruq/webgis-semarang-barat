const fs = require('fs');
const path = require('path');
const proj4 = require('proj4');

// Define coordinate systems
const utm49s = '+proj=utm +zone=49 +south +ellps=WGS84 +datum=WGS84 +units=m +no_defs';
const wgs84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

// Transform geometry from UTM to WGS84
function transformPoint(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return coordinates;
  }
  
  const [x, y] = coordinates;
  const [lng, lat] = proj4(utm49s, wgs84, [x, y]);
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

// Get jenis bencana from filename or kelurahan
function getJenisBencana(filename, kelurahanSlug) {
  const lowerFilename = filename.toLowerCase();
  if (lowerFilename.includes('banjir')) {
    return 'banjir';
  } else if (lowerFilename.includes('longsor') || lowerFilename.includes('bencana')) {
    // "bencana" biasanya berarti longsor berdasarkan konteks
    return 'longsor';
  }
  // For Evakuasi-Krobokan and Permukiman-Tawangmas, treat as banjir
  if (lowerFilename.includes('evakuasi') && lowerFilename.includes('krobokan')) {
    return 'banjir';
  }
  if (lowerFilename.includes('permukiman') && lowerFilename.includes('tawangmas')) {
    return 'banjir';
  }
  // Fallback: determine by kelurahan if not in filename
  if (['krobokan', 'tawangmas', 'kalibanteng-kulon', 'karangayu'].includes(kelurahanSlug)) {
    return 'banjir';
  }
  if (['ngemplak-simongan', 'manyaran', 'bongsari', 'gisikdrono'].includes(kelurahanSlug)) {
    return 'longsor';
  }
  return 'unknown';
}

// Get jenis titik from filename
function getJenisTitik(filename) {
  const lowerFilename = filename.toLowerCase();
  // For Evakuasi-Krobokan and Permukiman-Tawangmas, treat as kejadian
  if (lowerFilename.includes('evakuasi') && lowerFilename.includes('krobokan')) {
    return 'kejadian';
  }
  if (lowerFilename.includes('permukiman') && lowerFilename.includes('tawangmas')) {
    return 'kejadian';
  }
  if (lowerFilename.includes('evakuasi')) {
    return 'evakuasi';
  } else if (lowerFilename.includes('permukiman')) {
    return 'permukiman';
  } else if (lowerFilename.includes('kejadian')) {
    return 'kejadian';
  }
  return 'kejadian'; // default
}

// Main function
function mergeEventPoints() {
  const eventPointsDir = path.join(__dirname, '../public/data/evacuation/event-point');
  const files = [
    'Titik-Kejadian-Banjir-Kidul.geojson',
    'Titik-Kejadian-Banjir-Kulon.geojson',
    'Titik-Kejadian-Longsor-Kidul.geojson',
    'Titik-Kejadian-Longsor-Bongsari.geojson',
    'Titik-Kejadian-Longsor-Manyaran.geojson',
    'Titik-Permukiman-Tawangmas.geojson',
    'Titik-Evakuasi-Krobokan.geojson',
    'TITIK-BENCANA-GISIKDRONO.geojson',
    'Titik-Kejadian-Banjir-Karangayu.geojson',
    'Titik-Longsor-SemarangBarat.geojson',
    'Titik-Banjir-Karangayu2.geojson'
  ];

  const allFeatures = [];

  files.forEach((filename, index) => {
    const filePath = path.join(eventPointsDir, filename);
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const geojson = JSON.parse(fileContent);
      
      if (geojson.features && Array.isArray(geojson.features)) {
        geojson.features.forEach((feature, featureIndex) => {
          // Check if feature has KELURAHAN property, otherwise use filename
          let kelurahanInfo = getKelurahanFromFilename(filename);
          if (feature.properties.KELURAHAN) {
            const kelurahanName = feature.properties.KELURAHAN.toLowerCase().trim();
            // Map kelurahan name to slug
            const kelurahanMap = {
              'manyaran': { kelurahan: 'manyaran', slug_kelurahan: 'manyaran', nama_kelurahan: 'Manyaran' },
              'ngemplak simongan': { kelurahan: 'ngemplak-simongan', slug_kelurahan: 'ngemplak-simongan', nama_kelurahan: 'Ngemplak Simongan' },
              'kalibanteng kulon': { kelurahan: 'kalibanteng-kulon', slug_kelurahan: 'kalibanteng-kulon', nama_kelurahan: 'Kalibanteng Kulon' },
              'bongsari': { kelurahan: 'bongsari', slug_kelurahan: 'bongsari', nama_kelurahan: 'Bongsari' },
              'gisikdrono': { kelurahan: 'gisikdrono', slug_kelurahan: 'gisikdrono', nama_kelurahan: 'Gisikdrono' },
              'kalibanteng kidul': { kelurahan: 'kalibanteng-kidul', slug_kelurahan: 'kalibanteng-kidul', nama_kelurahan: 'Kalibanteng Kidul' },
              'krobokan': { kelurahan: 'krobokan', slug_kelurahan: 'krobokan', nama_kelurahan: 'Krobokan' },
              'tawangmas': { kelurahan: 'tawangmas', slug_kelurahan: 'tawangmas', nama_kelurahan: 'Tawangmas' },
              'karangayu': { kelurahan: 'karangayu', slug_kelurahan: 'karangayu', nama_kelurahan: 'Karangayu' }
            };
            
            // Try exact match first
            if (kelurahanMap[kelurahanName]) {
              kelurahanInfo = kelurahanMap[kelurahanName];
            } else {
              // Try partial match
              for (const [key, value] of Object.entries(kelurahanMap)) {
                if (kelurahanName.includes(key) || key.includes(kelurahanName)) {
                  kelurahanInfo = value;
                  break;
                }
              }
            }
          }
          
          // Check if feature has JB or Bencana property (Jenis Bencana)
          const featureJB = feature.properties.JB || feature.properties.Bencana || feature.properties.jenis_bencana || '';
          let jenisBencana = getJenisBencana(filename, kelurahanInfo.slug_kelurahan);
          // Override with feature property if available
          if (featureJB && (featureJB.toLowerCase().includes('longsor') || featureJB.toLowerCase().includes('banjir'))) {
            jenisBencana = featureJB.toLowerCase().includes('longsor') ? 'longsor' : 'banjir';
          }
          const jenisTitik = getJenisTitik(filename);
          
          let coordinates = null;
          let geometryType = feature.geometry.type;
          
          if (geometryType === 'Point') {
            coordinates = feature.geometry.coordinates;
          } else if (geometryType === 'MultiPoint') {
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
          
          let transformedCoordinates = coordinates;
          // Check CRS - OGC:1.3:CRS84 is WGS84, so no transformation needed
          const crsName = geojson.crs && geojson.crs.properties ? geojson.crs.properties.name : '';
          const isUTM49 = crsName.includes('EPSG::32749');
          const isUTM48 = crsName.includes('EPSG::32748');
          const isWGS84 = crsName.includes('OGC:1.3:CRS84') || crsName.includes('EPSG:4326');
          const looksLikeUTM = !isWGS84 && coordinates && coordinates.length >= 2 && Math.abs(coordinates[0]) > 1000 && Math.abs(coordinates[1]) > 1000;
          
          if ((isUTM49 || isUTM48 || looksLikeUTM) && !isWGS84) {
            transformedCoordinates = transformPoint(coordinates, crsName);
          }
          
          // Ensure coordinates are always [lng, lat]
          const finalCoordinates = transformedCoordinates.length > 2 ? transformedCoordinates.slice(0, 2) : transformedCoordinates;
          
          // Standardize nama field - use original data from GeoJSON
          // Check for ALMT (alamat), Alamat, or Name property
          let nama = feature.properties.Name || feature.properties.nama || feature.properties.Nama || feature.properties.ALMT || feature.properties.Alamat;
          if (!nama) {
            // Use geojson name or generate based on jenis titik
            if (jenisTitik === 'permukiman') {
              nama = geojson.name || `Titik Permukiman ${featureIndex + 1}`;
            } else if (jenisTitik === 'evakuasi') {
              nama = geojson.name || `Titik Evakuasi ${featureIndex + 1}`;
            } else {
              nama = geojson.name || `Titik Kejadian ${index + 1}`;
            }
          }
          
          // Set label based on jenis titik and jenis bencana
          let label = nama;
          if (jenisTitik === 'kejadian' && jenisBencana === 'banjir') {
            // For kejadian banjir, use "Titik Banjir"
            label = `Titik Banjir ${featureIndex + 1}`;
          } else if (jenisTitik === 'kejadian' && jenisBencana === 'longsor') {
            // For kejadian longsor, use "Titik Longsor"
            label = `Titik Longsor ${featureIndex + 1}`;
          } else if (jenisTitik === 'evakuasi' || jenisTitik === 'permukiman') {
            // For Evakuasi and Permukiman that are not converted to kejadian, use geojson name
            label = geojson.name || nama;
          } else {
            label = nama;
          }
          
          // Build deskripsi from available properties
          let deskripsi = feature.properties.deskripsi || feature.properties.description || feature.properties.descriptio;
          if (!deskripsi && (feature.properties.DAMPAK || feature.properties.Penyebab || feature.properties.Alamat)) {
            const parts = [];
            if (feature.properties.ALMT || feature.properties.Alamat) {
              parts.push(`Lokasi: ${feature.properties.ALMT || feature.properties.Alamat}`);
            }
            if (feature.properties.DAMPAK) parts.push(`Dampak: ${feature.properties.DAMPAK}`);
            if (feature.properties.PENYEBAB || feature.properties.Penyebab) {
              parts.push(`Penyebab: ${feature.properties.PENYEBAB || feature.properties.Penyebab}`);
            }
            if (feature.properties.TGL_KEJ) parts.push(`Tanggal: ${feature.properties.TGL_KEJ}`);
            deskripsi = parts.join(' | ') || `Titik kejadian ${jenisBencana} di ${kelurahanInfo.nama_kelurahan}`;
          } else if (!deskripsi) {
            deskripsi = jenisTitik === 'kejadian' ? `Titik kejadian ${jenisBencana} di ${kelurahanInfo.nama_kelurahan}` : `${label} di ${kelurahanInfo.nama_kelurahan}`;
          }
          
          // Create new feature with proper properties
          const newFeature = {
            type: 'Feature',
            properties: {
              id: `event-${index + 1}-${featureIndex + 1}`,
              nama: nama,
              label: label,
              deskripsi: deskripsi,
              kelurahan: kelurahanInfo.kelurahan,
              slug_kelurahan: kelurahanInfo.slug_kelurahan,
              nama_kelurahan: kelurahanInfo.nama_kelurahan,
              jenis_bencana: jenisBencana,
              jenis_titik: jenisTitik,
              // Preserve original properties
              ...feature.properties
            },
            geometry: {
              type: 'Point',
              coordinates: finalCoordinates
            }
          };
          
          allFeatures.push(newFeature);
        });
      }
    } catch (error) {
      console.error(`Error processing ${filename}:`, error.message);
    }
  });

  // Deduplicate features based on coordinates (within ~1 meter tolerance)
  // This helps remove duplicate points from different files
  const deduplicatedFeatures = [];
  const seenCoordinates = new Set();
  const TOLERANCE = 0.00001; // ~1 meter in degrees
  
  allFeatures.forEach((feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    // Round coordinates to tolerance level for comparison
    const roundedLng = Math.round(lng / TOLERANCE) * TOLERANCE;
    const roundedLat = Math.round(lat / TOLERANCE) * TOLERANCE;
    const coordKey = `${roundedLng},${roundedLat}`;
    
    if (!seenCoordinates.has(coordKey)) {
      seenCoordinates.add(coordKey);
      deduplicatedFeatures.push(feature);
    } else {
      console.log(`⚠️  Removed duplicate point at (${lng.toFixed(6)}, ${lat.toFixed(6)}) - ${feature.properties.nama || feature.properties.label}`);
    }
  });

  // Create merged GeoJSON
  const mergedGeoJSON = {
    type: 'FeatureCollection',
    features: deduplicatedFeatures
  };

  // Write to event-point.geojson
  const outputPath = path.join(eventPointsDir, 'event-point.geojson');
  fs.writeFileSync(outputPath, JSON.stringify(mergedGeoJSON, null, 2), 'utf8');
  
  console.log(`✅ Successfully merged ${allFeatures.length} event points`);
  console.log(`🔄 Removed ${allFeatures.length - deduplicatedFeatures.length} duplicate points`);
  console.log(`✅ Final count: ${deduplicatedFeatures.length} unique event points`);
  console.log(`📁 Saved to: ${outputPath}`);
  
  // Summary by kelurahan
  const summary = {};
  deduplicatedFeatures.forEach(f => {
    const kel = f.properties.nama_kelurahan;
    summary[kel] = (summary[kel] || 0) + 1;
  });
  
  console.log('\n📊 Summary by Kelurahan:');
  Object.entries(summary).forEach(([kel, count]) => {
    console.log(`  ${kel}: ${count} points`);
  });
  
  // Summary by jenis bencana
  const summaryByJenis = {};
  deduplicatedFeatures.forEach(f => {
    const jenis = f.properties.jenis_bencana;
    summaryByJenis[jenis] = (summaryByJenis[jenis] || 0) + 1;
  });
  
  console.log('\n📊 Summary by Jenis Bencana:');
  Object.entries(summaryByJenis).forEach(([jenis, count]) => {
    console.log(`  ${jenis}: ${count} points`);
  });
}

// Run the merge
mergeEventPoints();
