const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "../public/data/infrastructure/facilities.geojson",
);

// Read the file
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

// List of bank names to filter out
const bankNames = [
  "Bank Syariah Indonesia",
  "Bank Mandiri",
  "BRI",
  "BPR Gunung Rizki",
  "BPR Weleri Makmur",
  "BTPN",
  "Bank Mayapada",
  "OCBC",
  "BCA",
  "Bank Bukopin",
];

// Filter out banks and update categories
data.features = data.features
  .filter((feature) => !bankNames.includes(feature.properties.nama))
  .map((feature) => {
    if (feature.properties.kategori === "sekolah") {
      feature.properties.kategori = "Fasilitas Pendidikan";
    } else if (feature.properties.kategori === "puskesmas") {
      feature.properties.kategori = "Fasilitas Kesehatan";
    }
    return feature;
  });

// Write back to file
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

console.log("✅ Processing complete!");
console.log(`Total features: ${data.features.length}`);
console.log(
  `Removed ${data.features.filter((f) => bankNames.includes(f.properties.nama)).length} banks`,
);
