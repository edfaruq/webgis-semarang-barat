const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "../public/data/infrastructure/facilities.geojson",
);

// Read existing data
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

// Data fasilitas tambahan lagi untuk kelengkapan
const moreFacilities = [
  // MANYARAN - Tambahan
  {
    nama: "Pustu Manyaran",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Puspanjolo",
    kelurahan: "manyaran",
    nama_kelurahan: "Manyaran",
    koordinat: [110.384, -7.0095],
  },
  {
    nama: "SD Negeri Manyaran 02",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Puspanjolo Timur",
    kelurahan: "manyaran",
    nama_kelurahan: "Manyaran",
    koordinat: [110.3855, -7.004],
  },
  {
    nama: "SMA Negeri 8 Semarang",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan WR. Supratman",
    kelurahan: "manyaran",
    nama_kelurahan: "Manyaran",
    koordinat: [110.3875, -7.0015],
  },
  {
    nama: "Mushola Hidayah",
    kategori: "Masjid",
    alamat: "Jalan Puspanjolo Tengah",
    kelurahan: "manyaran",
    nama_kelurahan: "Manyaran",
    koordinat: [110.387, -7.0065],
  },

  // KROBOKAN - Tambahan
  {
    nama: "Pustu Krobokan",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Ariloka Raya",
    kelurahan: "krobokan",
    nama_kelurahan: "Krobokan",
    koordinat: [110.3955, -6.9745],
  },
  {
    nama: "SD Negeri Krobokan 02",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Puspogiwang",
    kelurahan: "krobokan",
    nama_kelurahan: "Krobokan",
    koordinat: [110.399, -6.9775],
  },
  {
    nama: "SMA Negeri 10 Semarang",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Krobokan",
    kelurahan: "krobokan",
    nama_kelurahan: "Krobokan",
    koordinat: [110.402, -6.982],
  },
  {
    nama: "Mushola Baitul Ihsan",
    kategori: "Masjid",
    alamat: "Jalan Ariloka",
    kelurahan: "krobokan",
    nama_kelurahan: "Krobokan",
    koordinat: [110.397, -6.973],
  },

  // BONGSARI - Tambahan
  {
    nama: "Pustu Bongsari",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Taman Condrokusumo",
    kelurahan: "bongsari",
    nama_kelurahan: "Bongsari",
    koordinat: [110.396, -6.996],
  },
  {
    nama: "SD Negeri Bongsari 02",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Bongsari",
    kelurahan: "bongsari",
    nama_kelurahan: "Bongsari",
    koordinat: [110.3935, -6.9945],
  },
  {
    nama: "Mushola Mujahiddin",
    kategori: "Masjid",
    alamat: "Jalan Taman Condrokusumo",
    kelurahan: "bongsari",
    nama_kelurahan: "Bongsari",
    koordinat: [110.394, -6.9875],
  },

  // GISIK DRONO - Tambahan
  {
    nama: "Pustu Gisik Drono",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Puspogiwang",
    kelurahan: "gisik-drono",
    nama_kelurahan: "Gisik Drono",
    koordinat: [110.3905, -6.98],
  },
  {
    nama: "SD Negeri Gisik Drono 02",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Puspowarno Selatan",
    kelurahan: "gisik-drono",
    nama_kelurahan: "Gisik Drono",
    koordinat: [110.392, -6.9825],
  },
  {
    nama: "Mushola Al-Mansyur",
    kategori: "Masjid",
    alamat: "Jalan Puspowarno",
    kelurahan: "gisik-drono",
    nama_kelurahan: "Gisik Drono",
    koordinat: [110.3915, -6.987],
  },

  // KARANGAYU - Tambahan
  {
    nama: "Pustu Karangayu",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Damarwulan",
    kelurahan: "karangayu",
    nama_kelurahan: "Karangayu",
    koordinat: [110.389, -6.9825],
  },
  {
    nama: "Klinik Sehat Karangayu",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Anjasmoro",
    kelurahan: "karangayu",
    nama_kelurahan: "Karangayu",
    koordinat: [110.3925, -6.977],
  },
  {
    nama: "SD Negeri Karangayu 02",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Kenconowungu",
    kelurahan: "karangayu",
    nama_kelurahan: "Karangayu",
    koordinat: [110.391, -6.984],
  },
  {
    nama: "SMA Negeri 14 Semarang",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Jendral Sudirman",
    kelurahan: "karangayu",
    nama_kelurahan: "Karangayu",
    koordinat: [110.392, -6.9795],
  },
  {
    nama: "Mushola At-Tauhid",
    kategori: "Masjid",
    alamat: "Jalan Kenconowungu",
    kelurahan: "karangayu",
    nama_kelurahan: "Karangayu",
    koordinat: [110.3935, -6.982],
  },

  // TAWANGMAS - Tambahan
  {
    nama: "Pustu Tawangmas",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Tawang Rejosari",
    kelurahan: "tawangmas",
    nama_kelurahan: "Tawangmas",
    koordinat: [110.388, -6.971],
  },
  {
    nama: "Klinik Pratama Tawangmas",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Yos Sudarso",
    kelurahan: "tawangmas",
    nama_kelurahan: "Tawangmas",
    koordinat: [110.3915, -6.973],
  },
  {
    nama: "SD Negeri Tawangmas 02",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Adenia",
    kelurahan: "tawangmas",
    nama_kelurahan: "Tawangmas",
    koordinat: [110.3685, -6.9705],
  },
  {
    nama: "Mushola Al-Falah",
    kategori: "Masjid",
    alamat: "Jalan Tawang Rejosari",
    kelurahan: "tawangmas",
    nama_kelurahan: "Tawangmas",
    koordinat: [110.394, -6.975],
  },

  // KALIBANTENG KIDUL - Tambahan
  {
    nama: "Pustu Kalibanteng Kidul",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Watugunung",
    kelurahan: "kalibanteng-kidul",
    nama_kelurahan: "Kalibanteng Kidul",
    koordinat: [110.371, -6.987],
  },
  {
    nama: "Klinik 24 Jam Kalibanteng",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Srirejeki Raya",
    kelurahan: "kalibanteng-kidul",
    nama_kelurahan: "Kalibanteng Kidul",
    koordinat: [110.3855, -6.9945],
  },
  {
    nama: "SD Negeri Kalibanteng Kidul 02",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Subali Raya",
    kelurahan: "kalibanteng-kidul",
    nama_kelurahan: "Kalibanteng Kidul",
    koordinat: [110.3675, -6.9875],
  },
  {
    nama: "SMP Negeri 35 Semarang",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Taman Sri Rejeki",
    kelurahan: "kalibanteng-kidul",
    nama_kelurahan: "Kalibanteng Kidul",
    koordinat: [110.384, -6.9905],
  },
  {
    nama: "Mushola Siti Fatimah",
    kategori: "Masjid",
    alamat: "Jalan Watugunung",
    kelurahan: "kalibanteng-kidul",
    nama_kelurahan: "Kalibanteng Kidul",
    koordinat: [110.372, -6.98],
  },

  // KALIBANTENG KULON - Tambahan
  {
    nama: "Pustu Kalibanteng Kulon",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Lebdosari",
    kelurahan: "kalibanteng-kulon",
    nama_kelurahan: "Kalibanteng Kulon",
    koordinat: [110.38, -6.99],
  },
  {
    nama: "Klinik Kesehatan Jembawan",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Jembawan Raya",
    kelurahan: "kalibanteng-kulon",
    nama_kelurahan: "Kalibanteng Kulon",
    koordinat: [110.376, -6.9835],
  },
  {
    nama: "SD Negeri Kalibanteng Kulon 02",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Borobudur",
    kelurahan: "kalibanteng-kulon",
    nama_kelurahan: "Kalibanteng Kulon",
    koordinat: [110.377, -6.997],
  },
  {
    nama: "SMA Negeri 16 Semarang",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Abdul Rahman Saleh",
    kelurahan: "kalibanteng-kulon",
    nama_kelurahan: "Kalibanteng Kulon",
    koordinat: [110.3815, -6.9895],
  },
  {
    nama: "Mushola Raudatul Jannah",
    kategori: "Masjid",
    alamat: "Jalan Wologito",
    kelurahan: "kalibanteng-kulon",
    nama_kelurahan: "Kalibanteng Kulon",
    koordinat: [110.3745, -6.989],
  },

  // NGEMPLAK SIMONGAN - Tambahan
  {
    nama: "Pustu Ngemplak Simongan",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Srinindito",
    kelurahan: "ngemplak-simongan",
    nama_kelurahan: "Ngemplak Simongan",
    koordinat: [110.392, -6.9995],
  },
  {
    nama: "Klinik Bersalin Simongan",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Simongan",
    kelurahan: "ngemplak-simongan",
    nama_kelurahan: "Ngemplak Simongan",
    koordinat: [110.398, -7.002],
  },
  {
    nama: "SD Negeri Ngemplak Simongan 02",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Srinindito Timur",
    kelurahan: "ngemplak-simongan",
    nama_kelurahan: "Ngemplak Simongan",
    koordinat: [110.3945, -7.0025],
  },
  {
    nama: "SMA Negeri 26 Semarang",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Simongan",
    kelurahan: "ngemplak-simongan",
    nama_kelurahan: "Ngemplak Simongan",
    koordinat: [110.399, -6.999],
  },
  {
    nama: "Mushola Ar-Rahman",
    kategori: "Masjid",
    alamat: "Jalan Srinindito",
    kelurahan: "ngemplak-simongan",
    nama_kelurahan: "Ngemplak Simongan",
    koordinat: [110.3925, -7.0035],
  },
];

// Convert to GeoJSON features
const newFeatures = moreFacilities.map((facility) => ({
  type: "Feature",
  properties: {
    nama: facility.nama,
    kategori: facility.kategori,
    alamat: facility.alamat,
    kelurahan: facility.kelurahan,
    nama_kelurahan: facility.nama_kelurahan,
  },
  geometry: {
    type: "Point",
    coordinates: facility.koordinat,
  },
}));

// Merge with existing data (avoid duplicates)
const existingNames = new Set(data.features.map((f) => f.properties.nama));
const uniqueNewFeatures = newFeatures.filter(
  (f) => !existingNames.has(f.properties.nama),
);

data.features = [...data.features, ...uniqueNewFeatures];

// Write back to file
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

console.log("✅ Fasilitas tambahan berhasil ditambahkan!");
console.log(`Fasilitas baru ditambahkan: ${uniqueNewFeatures.length}`);
console.log(`Total fasilitas sekarang: ${data.features.length}`);
console.log("\n📊 Distribusi berdasarkan kategori:");

const categoryCount = {};
data.features.forEach((f) => {
  const cat = f.properties.kategori;
  categoryCount[cat] = (categoryCount[cat] || 0) + 1;
});

Object.entries(categoryCount)
  .sort()
  .forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });

console.log("\n📍 Distribusi berdasarkan kelurahan:");
const kelurahCount = {};
data.features.forEach((f) => {
  const kel = f.properties.nama_kelurahan;
  kelurahCount[kel] = (kelurahCount[kel] || 0) + 1;
});

Object.entries(kelurahCount)
  .sort()
  .forEach(([kel, count]) => {
    console.log(`  ${kel}: ${count} fasilitas`);
  });
