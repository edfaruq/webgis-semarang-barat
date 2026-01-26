# Konversi KML ke GeoJSON

Script untuk mengkonversi file KML ke format GeoJSON yang digunakan oleh aplikasi.

## Cara Penggunaan

### 1. Siapkan file KML
- Export data fasilitas dari Google Maps/Google Earth sebagai file `.kml`
- Simpan file KML di folder project (misalnya di `data/` atau root folder)

### 2. Jalankan script konversi

```bash
node scripts/kml-to-geojson.js <input.kml> <output.geojson> [kategori] [kelurahan]
```

### Contoh:

**Konversi fasilitas kesehatan:**
```bash
node scripts/kml-to-geojson.js data/fasilitas-kesehatan.kml public/data/infrastructure/facilities.geojson puskesmas manyaran
```

**Parameter:**
- `input.kml` - Path ke file KML input
- `output.geojson` - Path ke file GeoJSON output (biasanya `public/data/infrastructure/facilities.geojson`)
- `kategori` (opsional) - Kategori fasilitas (default: `puskesmas`)
  - `puskesmas` / `kesehatan` - Fasilitas kesehatan (akan menggunakan icon tanda +)
  - `sekolah` - Sekolah
  - `posko` - Posko
  - `pasar` - Pasar
  - `masjid` - Masjid
  - `gereja` - Gereja
  - `lainnya` - Kategori lainnya
- `kelurahan` (opsional) - Nama kelurahan (akan di-convert ke slug otomatis)

### 3. Script akan:
- ✅ Membaca file KML
- ✅ Mengekstrak semua Point features (Placemark dengan koordinat)
- ✅ Mengkonversi ke format GeoJSON
- ✅ Merge dengan data existing (jika file output sudah ada)
- ✅ Menghindari duplikasi berdasarkan koordinat

## Format KML yang Didukung

Script ini mendukung KML dengan struktur:

```xml
<Placemark>
  <name>Nama Fasilitas</name>
  <description>Alamat atau deskripsi</description>
  <Point>
    <coordinates>110.123456, -6.987654, 0</coordinates>
  </Point>
  <ExtendedData>
    <Data name="alamat">
      <value>Jalan Contoh No. 123</value>
    </Data>
    <Data name="kategori">
      <value>puskesmas</value>
    </Data>
  </ExtendedData>
</Placemark>
```

## Catatan

- Script akan **merge** dengan data existing, jadi tidak akan menghapus data lama
- Duplikasi dicegah berdasarkan koordinat (jika ada point dengan koordinat yang sama, akan di-skip)
- Format koordinat KML: `longitude,latitude,altitude` (altitude diabaikan)
- Format koordinat GeoJSON: `[longitude, latitude]`

## Icon Fasilitas Kesehatan

Fasilitas dengan kategori `puskesmas` atau `kesehatan` akan otomatis menggunakan icon:
- 🎯 Circle merah dengan tanda **+** putih di tengah
- Mirip dengan icon pompa air tapi dengan warna merah
- Ukuran: 30x30px dengan border putih 3px
