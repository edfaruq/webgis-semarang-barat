/**
 * Convert file JSON data banjir ke GeoJSON (.geojson)
 * 
 * File yang di-convert (semua sudah format FeatureCollection):
 * - Kerentanan-Bencana-Banjir.json
 * - Kapasitas-Banjir-Smg-Bar.json
 * - Risiko-Bencana-Banjir.json
 * - Bahaya-Banjir-KKNT.json
 * 
 * Jalankan: node scripts/convert-banjir-to-geojson.js
 */

const fs = require('fs');
const path = require('path');

const BANJIR_DIR = path.join(__dirname, '../public/data/disasters/banjir');

const FILES = [
  'Kerentanan-Bencana-Banjir',
  'Kapasitas-Banjir-Smg-Bar',
  'Risiko-Bencana-Banjir',
  'Bahaya-Banjir-KKNT',
];

function convertToGeoJSON(inputPath, outputPath) {
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
    throw new Error('Format tidak valid. Harus FeatureCollection dengan features.');
  }
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
  return data.features.length;
}

console.log('Konversi data banjir: .json → .geojson\n');

for (const base of FILES) {
  const jsonPath = path.join(BANJIR_DIR, `${base}.json`);
  const geojsonPath = path.join(BANJIR_DIR, `${base}.geojson`);

  if (!fs.existsSync(jsonPath)) {
    console.log(`⏭️  ${base}.json tidak ditemukan, skip.`);
    continue;
  }

  try {
    const count = convertToGeoJSON(jsonPath, geojsonPath);
    console.log(`✅ ${base}.json → ${base}.geojson (${count} fitur)`);
    fs.unlinkSync(jsonPath);
    console.log(`   🗑️  ${base}.json dihapus`);
  } catch (err) {
    console.error(`❌ ${base}:`, err.message);
  }
}

console.log('\n✅ Selesai. Referensi di kode harus diubah dari .json ke .geojson.');
