const fs = require('fs');
const path = require('path');

// Fungsi untuk convert JSON ke GeoJSON dengan format yang rapi
function convertToGeoJSON(inputPath, outputPath) {
  // Baca file JSON
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  
  // Pastikan formatnya sudah benar (FeatureCollection)
  let geoJSON;
  if (data.type === 'FeatureCollection' && data.features) {
    geoJSON = data;
  } else if (data.type === 'Feature') {
    geoJSON = {
      type: 'FeatureCollection',
      features: [data]
    };
  } else {
    throw new Error('Format tidak valid. Harus FeatureCollection atau Feature');
  }
  
  // Tulis ke file dengan format yang rapi (indent 2 spaces)
  fs.writeFileSync(outputPath, JSON.stringify(geoJSON, null, 2), 'utf8');
  
  return geoJSON.features.length;
}

// Convert file-file
const dataDir = path.join(__dirname, '../public/data');

// 1. Convert Bahaya-Banjir-KKNT.json ke .geojson
const banjirJsonPath = path.join(dataDir, 'Bahaya-Banjir-KKNT.json');
const banjirGeoJsonPath = path.join(dataDir, 'Bahaya-Banjir-KKNT.geojson');

if (fs.existsSync(banjirJsonPath)) {
  const count = convertToGeoJSON(banjirJsonPath, banjirGeoJsonPath);
  console.log(`✅ Converted Bahaya-Banjir-KKNT.json → Bahaya-Banjir-KKNT.geojson (${count} features)`);
  
  // Hapus file JSON lama
  fs.unlinkSync(banjirJsonPath);
  console.log(`🗑️  Deleted Bahaya-Banjir-KKNT.json`);
} else {
  console.log(`⚠️  File Bahaya-Banjir-KKNT.json tidak ditemukan`);
}

// 2. Convert LahanKritis.json ke .geojson
const lahanKritisJsonPath = path.join(dataDir, 'LahanKritis.json');
const lahanKritisGeoJsonPath = path.join(dataDir, 'LahanKritis.geojson');

if (fs.existsSync(lahanKritisJsonPath)) {
  const count = convertToGeoJSON(lahanKritisJsonPath, lahanKritisGeoJsonPath);
  console.log(`✅ Converted LahanKritis.json → LahanKritis.geojson (${count} features)`);
  
  // Hapus file JSON lama
  fs.unlinkSync(lahanKritisJsonPath);
  console.log(`🗑️  Deleted LahanKritis.json`);
} else {
  console.log(`⚠️  File LahanKritis.json tidak ditemukan`);
}

// 3. Hapus file merged jika ada
const mergedPath = path.join(dataDir, 'merged-data.geojson');
if (fs.existsSync(mergedPath)) {
  fs.unlinkSync(mergedPath);
  console.log(`🗑️  Deleted merged-data.geojson`);
}

console.log(`\n✅ Selesai! Semua file sudah di-convert ke format GeoJSON.`);
