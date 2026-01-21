const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../public/data');

// Struktur folder baru
const newStructure = {
  'infrastructure': {
    'boundary.geojson': 'boundary.geojson',
    'facilities.geojson': 'facilities.geojson',
  },
  'disasters': {
    'banjir': {
      'Bahaya-Banjir-KKNT.geojson': 'Bahaya-Banjir-KKNT.geojson',
      'flood-risk.geojson': 'flood-risk.geojson', // jika ada
    },
    'longsor': {
      'landslide-risk.geojson': 'landslide-risk.geojson',
    },
    'lahan-kritis': {
      'LahanKritis.geojson': 'LahanKritis.geojson',
    },
  },
  'routes': {
    'evacuation-route.geojson': 'evacuation-route.geojson',
  },
  'utilities': {
    // Folder untuk data masa depan (drainase, pompa-air, dll)
    // Akan dibuat otomatis
  },
};

// Fungsi untuk membuat folder jika belum ada
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

// Fungsi untuk memindahkan file
function moveFile(source, destination) {
  if (fs.existsSync(source)) {
    ensureDir(path.dirname(destination));
    fs.renameSync(source, destination);
    console.log(`✅ Moved: ${path.basename(source)} → ${path.relative(dataDir, destination)}`);
    return true;
  } else {
    console.log(`⚠️  File not found: ${source}`);
    return false;
  }
}

console.log('🔄 Reorganizing data structure...\n');

// Proses reorganisasi
let movedCount = 0;

// 1. Infrastructure
console.log('📦 Processing infrastructure...');
const infraDir = path.join(dataDir, 'infrastructure');
ensureDir(infraDir);

for (const [newName, oldName] of Object.entries(newStructure.infrastructure)) {
  const source = path.join(dataDir, oldName);
  const dest = path.join(infraDir, newName);
  if (moveFile(source, dest)) movedCount++;
}

// 2. Disasters
console.log('\n🌊 Processing disasters...');
for (const [disasterType, files] of Object.entries(newStructure.disasters)) {
  const disasterDir = path.join(dataDir, 'disasters', disasterType);
  ensureDir(disasterDir);
  
  for (const [newName, oldName] of Object.entries(files)) {
    const source = path.join(dataDir, oldName);
    const dest = path.join(disasterDir, newName);
    if (moveFile(source, dest)) movedCount++;
  }
}

// 3. Routes
console.log('\n🛣️  Processing routes...');
const routesDir = path.join(dataDir, 'routes');
ensureDir(routesDir);

for (const [newName, oldName] of Object.entries(newStructure.routes)) {
  const source = path.join(dataDir, oldName);
  const dest = path.join(routesDir, newName);
  if (moveFile(source, dest)) movedCount++;
}

// 4. Utilities (folder untuk masa depan)
console.log('\n🔧 Creating utilities folders...');
const utilitiesDir = path.join(dataDir, 'utilities');
ensureDir(utilitiesDir);
ensureDir(path.join(utilitiesDir, 'drainase'));
ensureDir(path.join(utilitiesDir, 'pompa-air'));

// Buat README di setiap folder untuk dokumentasi
const readmeContent = {
  'disasters/banjir': `# Data Banjir

Folder ini berisi data terkait banjir.
- **Pemilik**: Farhan
- **File**: Bahaya-Banjir-KKNT.geojson, flood-risk.geojson

## Format Data
Semua file harus dalam format GeoJSON FeatureCollection.
`,

  'disasters/longsor': `# Data Longsor

Folder ini berisi data terkait longsor.
- **Pemilik**: Faruq
- **File**: landslide-risk.geojson

## Format Data
Semua file harus dalam format GeoJSON FeatureCollection.
`,

  'disasters/lahan-kritis': `# Data Lahan Kritis

Folder ini berisi data terkait lahan kritis.
- **Pemilik**: Shaqi
- **File**: LahanKritis.geojson

## Format Data
Semua file harus dalam format GeoJSON FeatureCollection.
`,

  'utilities/drainase': `# Data Drainase

Folder ini untuk data drainase (masa depan).
Tambahkan file GeoJSON di sini.
`,

  'utilities/pompa-air': `# Data Pompa Air

Folder ini untuk data pompa air (masa depan).
Tambahkan file GeoJSON di sini.
`,
};

for (const [folder, content] of Object.entries(readmeContent)) {
  const readmePath = path.join(dataDir, folder, 'README.md');
  ensureDir(path.dirname(readmePath));
  fs.writeFileSync(readmePath, content, 'utf8');
  console.log(`📝 Created README: ${folder}/README.md`);
}

// Buat README utama
const mainReadme = `# Struktur Data GeoJSON

Struktur folder ini diorganisir berdasarkan kategori untuk memudahkan kolaborasi tim.

## Struktur Folder

\`\`\`
data/
├── infrastructure/          # Data infrastruktur dasar
│   ├── boundary.geojson    # Batas wilayah
│   └── facilities.geojson  # Fasilitas umum
│
├── disasters/              # Data bencana (setiap anggota tim punya folder)
│   ├── banjir/             # Farhan - Data banjir
│   ├── longsor/            # Faruq - Data longsor
│   └── lahan-kritis/       # Shaqi - Data lahan kritis
│
├── routes/                 # Data rute
│   └── evacuation-route.geojson
│
└── utilities/              # Data utilitas (untuk masa depan)
    ├── drainase/
    └── pompa-air/
\`\`\`

## Pembagian Tugas Tim

- **Farhan**: \`disasters/banjir/\`
- **Faruq**: \`disasters/longsor/\`
- **Shaqi**: \`disasters/lahan-kritis/\`

## Menambah Data Baru

1. Buat folder baru di kategori yang sesuai
2. Tambahkan file GeoJSON di folder tersebut
3. Update path di \`app/page.tsx\` dan \`app/kelurahan/[slug]/page.tsx\`
4. Update komponen Map jika perlu styling khusus

## Format File

Semua file harus dalam format GeoJSON FeatureCollection yang valid.
`;

fs.writeFileSync(path.join(dataDir, 'README.md'), mainReadme, 'utf8');
console.log(`📝 Created main README: data/README.md`);

console.log(`\n✅ Reorganization complete!`);
console.log(`📊 Moved ${movedCount} files`);
console.log(`\n📖 Check data/README.md for documentation`);
