# Data Pompa Air

Folder ini berisi data titik pompa air di wilayah Semarang Barat.

## Struktur Data

File `pompa-air.geojson` berisi data titik pompa dalam format GeoJSON dengan struktur properties:

- `nama`: Nama pompa air
- `kapasitas`: Kapasitas pompa (contoh: "1000 L/menit")
- `kondisi`: Kondisi pompa (contoh: "Baik", "Perlu Perawatan", "Rusak")
- `pengelola`: Instansi yang mengelola pompa
- `operator`: Nama operator/petugas
- `no_telp`: Nomor telepon operator
- `alamat`: Alamat lokasi pompa
- `kelurahan`: Slug kelurahan (untuk filtering)
- `nama_kelurahan`: Nama kelurahan
- `foto`: Path ke foto kondisi pompa (relatif dari public folder)

## Foto

Simpan foto pompa di folder `images/` dengan nama file sesuai yang didefinisikan di property `foto` pada GeoJSON.

Contoh:
- Jika `foto: "/data/utilities/pompa-air/images/pompa-1.jpg"`, maka file harus ada di `public/data/utilities/pompa-air/images/pompa-1.jpg`

## Format KML/KMZ

**Ya, file KML/KMZ bisa digunakan!**

Leaflet (library peta yang digunakan) tidak secara native mendukung KML/KMZ, tetapi Anda bisa:

1. **Konversi KML/KMZ ke GeoJSON** (disarankan):
   - Gunakan tool online seperti [MyGeoData Converter](https://mygeodata.cloud/converter/kml-to-geojson)
   - Atau gunakan library seperti `@mapbox/togeojson` untuk konversi di aplikasi
   - Setelah dikonversi, simpan sebagai GeoJSON di folder ini

2. **Gunakan plugin Leaflet untuk KML**:
   - Install plugin seperti `leaflet-omnivore` atau `togeojson`
   - Load KML langsung di aplikasi (lebih kompleks)

**Rekomendasi**: Konversi KML/KMZ ke GeoJSON terlebih dahulu karena:
- Lebih mudah diintegrasikan dengan struktur yang sudah ada
- Performa lebih baik
- Lebih mudah untuk dimodifikasi dan di-version control
