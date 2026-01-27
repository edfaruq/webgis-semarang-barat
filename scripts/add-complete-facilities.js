const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "../public/data/infrastructure/facilities.geojson",
);

// Read existing data
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

// Data fasilitas tambahan berdasarkan kelurahan di Semarang Barat
const additionalFacilities = [
  // MANYARAN
  {
    nama: "Puskesmas Manyaran",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Puspanjolo Tengah",
    kelurahan: "manyaran",
    nama_kelurahan: "Manyaran",
    koordinat: [110.3865, -7.0075],
  },
  {
    nama: "SD Negeri Manyaran 01",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Puspanjolo",
    kelurahan: "manyaran",
    nama_kelurahan: "Manyaran",
    koordinat: [110.3878, -7.0055],
  },
  {
    nama: "SMP Negeri 12 Semarang",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan WR. Supratman",
    kelurahan: "manyaran",
    nama_kelurahan: "Manyaran",
    koordinat: [110.3892, -7.001],
  },
  {
    nama: "Masjid Al-Ikhlas Manyaran",
    kategori: "Masjid",
    alamat: "Jalan Puspanjolo Timur",
    kelurahan: "manyaran",
    nama_kelurahan: "Manyaran",
    koordinat: [110.3845, -7.0085],
  },

  // KROBOKAN
  {
    nama: "Puskesmas Krobokan",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Krobokan Raya",
    kelurahan: "krobokan",
    nama_kelurahan: "Krobokan",
    koordinat: [110.401, -6.9785],
  },
  {
    nama: "SD Negeri Krobokan 01",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Ariloka",
    kelurahan: "krobokan",
    nama_kelurahan: "Krobokan",
    koordinat: [110.3975, -6.976],
  },
  {
    nama: "SMP Negeri 23 Semarang",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Krobokan",
    kelurahan: "krobokan",
    nama_kelurahan: "Krobokan",
    koordinat: [110.4005, -6.98],
  },
  {
    nama: "Masjid Raya Krobokan",
    kategori: "Masjid",
    alamat: "Jalan Puspogiwang",
    kelurahan: "krobokan",
    nama_kelurahan: "Krobokan",
    koordinat: [110.3985, -6.9815],
  },

  // BONGSARI
  {
    nama: "Puskesmas Bongsari",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Pamularsih",
    kelurahan: "bongsari",
    nama_kelurahan: "Bongsari",
    koordinat: [110.3948, -6.9895],
  },
  {
    nama: "SD Negeri Bongsari 01",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Taman Condrokusumo",
    kelurahan: "bongsari",
    nama_kelurahan: "Bongsari",
    koordinat: [110.3955, -6.992],
  },
  {
    nama: "Masjid Nurul Huda Bongsari",
    kategori: "Masjid",
    alamat: "Jalan Pamularsih",
    kelurahan: "bongsari",
    nama_kelurahan: "Bongsari",
    koordinat: [110.3938, -6.991],
  },

  // GISIK DRONO
  {
    nama: "Puskesmas Gisik Drono",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Puspowarno",
    kelurahan: "gisik-drono",
    nama_kelurahan: "Gisik Drono",
    koordinat: [110.391, -6.985],
  },
  {
    nama: "SD Negeri Gisik Drono 01",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Puspogiwang",
    kelurahan: "gisik-drono",
    nama_kelurahan: "Gisik Drono",
    koordinat: [110.3925, -6.9875],
  },
  {
    nama: "Masjid Baitul Makdum",
    kategori: "Masjid",
    alamat: "Jalan Puspowarno Selatan",
    kelurahan: "gisik-drono",
    nama_kelurahan: "Gisik Drono",
    koordinat: [110.3895, -6.9835],
  },

  // KARANGAYU
  {
    nama: "Puskesmas Karangayu",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Anjasmoro Raya",
    kelurahan: "karangayu",
    nama_kelurahan: "Karangayu",
    koordinat: [110.392, -6.976],
  },
  {
    nama: "SD Negeri Karangayu 01",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Damarwulan",
    kelurahan: "karangayu",
    nama_kelurahan: "Karangayu",
    koordinat: [110.3905, -6.9805],
  },
  {
    nama: "SMP Negeri 18 Semarang",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Jendral Sudirman",
    kelurahan: "karangayu",
    nama_kelurahan: "Karangayu",
    koordinat: [110.3945, -6.9835],
  },
  {
    nama: "Masjid At-Taqwa Karangayu",
    kategori: "Masjid",
    alamat: "Jalan Anjasmoro",
    kelurahan: "karangayu",
    nama_kelurahan: "Karangayu",
    koordinat: [110.389, -6.9775],
  },

  // TAWANGMAS
  {
    nama: "Puskesmas Tawangmas",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Yos Sudarso",
    kelurahan: "tawangmas",
    nama_kelurahan: "Tawangmas",
    koordinat: [110.3925, -6.97],
  },
  {
    nama: "SD Negeri Tawangmas 01",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Tawang Rejosari",
    kelurahan: "tawangmas",
    nama_kelurahan: "Tawangmas",
    koordinat: [110.39, -6.972],
  },
  {
    nama: "Masjid Raya Tawangmas",
    kategori: "Masjid",
    alamat: "Jalan Yos Sudarso",
    kelurahan: "tawangmas",
    nama_kelurahan: "Tawangmas",
    koordinat: [110.391, -6.968],
  },

  // KALIBANTENG KIDUL
  {
    nama: "Puskesmas Kalibanteng Kidul",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Srirejeki Raya",
    kelurahan: "kalibanteng-kidul",
    nama_kelurahan: "Kalibanteng Kidul",
    koordinat: [110.384, -6.9905],
  },
  {
    nama: "SD Negeri Kalibanteng Kidul 01",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Watugunung",
    kelurahan: "kalibanteng-kidul",
    nama_kelurahan: "Kalibanteng Kidul",
    koordinat: [110.37, -6.983],
  },
  {
    nama: "Masjid Nurul Iman Kalibanteng",
    kategori: "Masjid",
    alamat: "Jalan Srirejeki Raya",
    kelurahan: "kalibanteng-kidul",
    nama_kelurahan: "Kalibanteng Kidul",
    koordinat: [110.385, -6.992],
  },

  // KALIBANTENG KULON
  {
    nama: "Puskesmas Kalibanteng Kulon",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Abdul Rahman Saleh",
    kelurahan: "kalibanteng-kulon",
    nama_kelurahan: "Kalibanteng Kulon",
    koordinat: [110.3805, -6.993],
  },
  {
    nama: "SD Negeri Kalibanteng Kulon 01",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Lebdosari",
    kelurahan: "kalibanteng-kulon",
    nama_kelurahan: "Kalibanteng Kulon",
    koordinat: [110.378, -6.988],
  },
  {
    nama: "SMP Negeri 28 Semarang",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Abdul Rahman Saleh",
    kelurahan: "kalibanteng-kulon",
    nama_kelurahan: "Kalibanteng Kulon",
    koordinat: [110.381, -6.996],
  },
  {
    nama: "Masjid Al-Hidayah Kalibanteng",
    kategori: "Masjid",
    alamat: "Jalan Wologito",
    kelurahan: "kalibanteng-kulon",
    nama_kelurahan: "Kalibanteng Kulon",
    koordinat: [110.375, -6.993],
  },

  // NGEMPLAK SIMONGAN
  {
    nama: "Puskesmas Ngemplak Simongan",
    kategori: "Fasilitas Kesehatan",
    alamat: "Jalan Simongan",
    kelurahan: "ngemplak-simongan",
    nama_kelurahan: "Ngemplak Simongan",
    koordinat: [110.3975, -6.9975],
  },
  {
    nama: "SD Negeri Ngemplak Simongan 01",
    kategori: "Fasilitas Pendidikan",
    alamat: "Jalan Srinindito",
    kelurahan: "ngemplak-simongan",
    nama_kelurahan: "Ngemplak Simongan",
    koordinat: [110.393, -7.001],
  },
  {
    nama: "Masjid Nurul Irham",
    kategori: "Masjid",
    alamat: "Jalan Simongan",
    kelurahan: "ngemplak-simongan",
    nama_kelurahan: "Ngemplak Simongan",
    koordinat: [110.396, -7.0],
  },

  // KANTOR KECAMATAN SEMARANG BARAT (Umum)
  {
    nama: "Kantor Kecamatan Semarang Barat",
    kategori: "Lainnya",
    alamat: "Jalan Jendral Sudirman",
    kelurahan: "karangayu",
    nama_kelurahan: "Karangayu",
    koordinat: [110.3912, -6.982],
  },
];

// Convert to GeoJSON features
const newFeatures = additionalFacilities.map((facility) => ({
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

// Merge with existing data (avoid duplicates by checking nama)
const existingNames = new Set(data.features.map((f) => f.properties.nama));
const uniqueNewFeatures = newFeatures.filter(
  (f) => !existingNames.has(f.properties.nama),
);

data.features = [...data.features, ...uniqueNewFeatures];

// Write back to file
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

console.log("✅ Fasilitas berhasil ditambahkan!");
console.log(`Total fasilitas sebelumnya: ${existingNames.size}`);
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
