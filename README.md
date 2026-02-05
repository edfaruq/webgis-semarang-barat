# WebGIS Semarang Barat

Sistem Informasi Geografis (WebGIS) interaktif untuk Kecamatan Semarang Barat menggunakan Next.js 14+, TypeScript, TailwindCSS, dan Leaflet.

## Fitur

- 🗺️ **Peta Interaktif**: Peta dasar OpenStreetMap dengan opsi basemap (OSM, Esri World Imagery)
- 📍 **Layer GeoJSON**: 
  - Polygon: Batas wilayah dengan styling, hover highlight, dan popup informasi
  - Point: Fasilitas dengan marker berbeda per kategori (sekolah, puskesmas, posko, pasar, tempat ibadah)
- 🎛️ **Sidebar Kontrol**:
  - Toggle layer (boundary, facilities)
  - Filter kategori fasilitas
  - Pencarian (search) berdasarkan nama fasilitas/wilayah
  - Legenda dinamis
  - Statistik ringkas (total fasilitas per kategori, luas wilayah)
- 🎮 **Kontrol Peta**:
  - Zoom in/out
  - Full extent (kembali ke view awal)
  - Locate Me (geolocation browser)
- 📱 **Responsif**: Desain yang mendukung desktop dan mobile
- 🏘️ **Halaman Kelurahan**: 9 kelurahan di Semarang Barat:
  - Krobokan
  - Ngemplak Simongan
  - Kalibanteng Kidul
  - Gisik Drono
  - Bongsari
  - Karangayu
  - Kalibanteng Kulon
  - Manyaran
  - Tawangmas

## Teknologi

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Mapping**: Leaflet + react-leaflet
- **Data Format**: GeoJSON

## Instalasi

### Prasyarat

- Node.js 18+ 
- npm atau yarn
- Laragon (untuk development server)

### Langkah Instalasi

1. **Clone atau download project ini**

2. **Setup Environment Variables**:
   ```bash
   # Copy file .env.example ke .env
   cp .env.example .env
   ```
   
   Edit file `.env` dan isi dengan konfigurasi database MySQL Anda:
   ```env
   DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"
   SESSION_SECRET="your-session-secret-change-in-production"
   ```

3. **Install dependencies**:
   ```bash
   npm install
   # atau
   yarn install
   ```
   
   > **Catatan**: Setelah `npm install`, script akan otomatis menjalankan:
   > - `prisma generate` untuk generate Prisma client
   > - Kompresi gambar peta untuk membuat thumbnail (50KB)
   > 
   > Jika terjadi error, pastikan `sharp` terinstall dengan benar.

4. **Setup Database**:
   ```bash
   # Push schema Prisma ke database
   npm run db:push
   # atau
   npx prisma db push
   ```
   
   > **Penting**: Pastikan database MySQL sudah dibuat dan `DATABASE_URL` di `.env` sudah benar sebelum menjalankan command ini.

5. **Jalankan development server**:
   ```bash
   npm run dev
   # atau
   yarn dev
   ```

4. **Buka browser**:
   ```
   http://localhost:3000
   ```

## Build untuk Production

```bash
npm run build
npm start
```

## Deployment ke Railway

Lihat panduan lengkap di [DEPLOYMENT.md](./DEPLOYMENT.md) untuk instruksi detail deployment ke Railway.

**Quick Start:**
1. Push code ke GitHub
2. Connect repository ke Railway
3. Setup MySQL database di Railway
4. Set environment variables (`DATABASE_URL`, `SESSION_SECRET`)
5. Push database schema: `railway run npx prisma db push`
6. Deploy selesai! 🚀

## Struktur Project

```
webgis-semarang-barat/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                 # Halaman utama
│   ├── globals.css              # Global styles
│   └── kelurahan/
│       └── [slug]/
│           └── page.tsx          # Halaman kelurahan dinamis
├── components/
│   ├── Map/
│   │   ├── MapComponent.tsx     # Komponen peta utama
│   │   └── MapControls.tsx      # Kontrol peta (zoom, locate, dll)
│   └── Sidebar.tsx              # Sidebar dengan kontrol layer
├── lib/
│   ├── geojson.ts               # Utility load GeoJSON
│   └── map-utils.ts             # Utility peta (bounds, center, dll)
├── types/
│   └── geojson.ts               # TypeScript types untuk GeoJSON
├── public/
│   └── data/
│       ├── boundary.geojson     # Data batas wilayah (dummy)
│       └── facilities.geojson   # Data fasilitas (dummy)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## Mengganti Data GeoJSON

### Data Batas Wilayah (`boundary.geojson`)

File: `public/data/boundary.geojson`

Format GeoJSON FeatureCollection dengan properties:
- `nama_wilayah` (string): Nama wilayah
- `nama_kelurahan` (string): Nama kelurahan
- `luas` (number): Luas dalam meter persegi
- `kode` (string): Kode wilayah (opsional)

Contoh:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "nama_wilayah": "Kelurahan Krobokan",
        "nama_kelurahan": "Krobokan",
        "luas": 1500000,
        "kode": "3374011"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[lng, lat], ...]]
      }
    }
  ]
}
```

### Data Fasilitas (`facilities.geojson`)

File: `public/data/facilities.geojson`

Format GeoJSON FeatureCollection dengan properties:
- `nama` (string): Nama fasilitas
- `kategori` (string): Kategori (sekolah, puskesmas, posko, pasar, tempat_ibadah, lainnya)
- `alamat` (string): Alamat fasilitas (opsional)

Contoh:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "nama": "SD Negeri Krobokan 01",
        "kategori": "sekolah",
        "alamat": "Jl. Krobokan Raya No. 123"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [lng, lat]
      }
    }
  ]
}
```

### Catatan Penting

1. **Koordinat**: Gunakan format `[longitude, latitude]` (lng, lat) untuk GeoJSON
2. **Koordinat Semarang Barat**: Sekitar `-6.9833, 110.3833`
3. **Format File**: Pastikan file GeoJSON valid (bisa dicek di [geojson.io](https://geojson.io))
4. **Ukuran File**: Untuk performa optimal, batasi ukuran file GeoJSON (< 5MB)

## Penggunaan

### Halaman Utama (`/`)

- Menampilkan peta Semarang Barat dengan semua layer
- Sidebar untuk kontrol layer, filter, dan pencarian

### Halaman Kelurahan (`/kelurahan/[slug]`)

- Halaman khusus untuk setiap kelurahan
- URL: `/kelurahan/krobokan`, `/kelurahan/ngemplak-simongan`, dll.

### Kontrol Peta

- **Zoom**: Tombol +/- di kanan atas
- **Full Extent**: Kembali ke view awal Semarang Barat
- **Locate Me**: Zoom ke posisi GPS user (perlu izin browser)

### Sidebar

- **Basemap Switcher**: Ganti antara OSM dan Satellite
- **Layer Toggle**: Aktifkan/nonaktifkan layer boundary dan facilities
- **Filter Kategori**: Filter fasilitas berdasarkan kategori
- **Pencarian**: Cari fasilitas atau wilayah, klik hasil untuk zoom
- **Legenda**: Menampilkan simbol layer yang aktif
- **Statistik**: Total fasilitas per kategori dan luas wilayah

## Scripts Tambahan

### Kompresi Gambar Peta

Script untuk membuat thumbnail gambar peta (50KB) dari gambar asli:

```bash
npm run compress-images
```

Script ini akan:
- Membaca semua gambar dari `public/images/peta/`
- Membuat thumbnail terkompresi (50KB) di `public/images/peta/thumbnails/`
- Otomatis dijalankan setelah `npm install` (via `postinstall` hook)

**Catatan**: Script ini membutuhkan library `sharp`. Jika belum terinstall, install dengan:
```bash
npm install sharp --save-dev
```

## Troubleshooting

### Error: "Failed to load GeoJSON"

- Pastikan file GeoJSON ada di `public/data/`
- Cek format GeoJSON valid
- Cek console browser untuk error detail

### Peta tidak muncul

- Pastikan Leaflet CSS ter-load
- Cek dynamic import MapComponent (ssr: false)
- Cek console browser untuk error

### Marker tidak muncul

- Pastikan Leaflet default icon ter-load
- Cek path icon di `MapComponent.tsx`

### Error saat kompresi gambar (postinstall)

Jika terjadi error saat `npm install` terkait kompresi gambar:
- Pastikan `sharp` terinstall: `npm install sharp --save-dev`
- Jika masih error, jalankan manual: `npm run compress-images`
- Thumbnail akan otomatis dibuat saat pertama kali menjalankan script

### Error "An unexpected response was received from the server" saat Submit Lapor Bencana

Jika teman Anda mengalami error ini saat submit lapor bencana, kemungkinan penyebabnya:

1. **Database tidak terhubung**:
   - Pastikan file `.env` sudah dibuat dan `DATABASE_URL` sudah dikonfigurasi dengan benar
   - Format: `DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"`
   - Pastikan database MySQL sudah dibuat dan bisa diakses

2. **Prisma Client belum di-generate**:
   ```bash
   npx prisma generate
   ```

3. **Schema database belum di-push**:
   ```bash
   npm run db:push
   # atau
   npx prisma db push
   ```

4. **Restart development server** setelah setup database:
   ```bash
   # Stop server (Ctrl+C), lalu jalankan lagi
   npm run dev
   ```

**Langkah troubleshooting lengkap:**
```bash
# 1. Pastikan .env sudah ada dan benar
cat .env

# 2. Generate Prisma client
npx prisma generate

# 3. Push schema ke database
npm run db:push

# 4. Restart dev server
npm run dev
```

Setelah langkah-langkah di atas, coba submit lapor bencana lagi. Error message yang lebih jelas akan muncul jika masih ada masalah.

## Pengembangan

### Menambah Kategori Fasilitas

Edit `components/Sidebar.tsx`:
1. Tambahkan kategori di array `FACILITY_CATEGORIES`
2. Tambahkan warna untuk kategori baru
3. Update type `FacilityProperties` di `types/geojson.ts`

### Menambah Basemap

Edit `components/Map/MapComponent.tsx`:
1. Tambahkan type di `BasemapType`
2. Tambahkan case di fungsi `getBasemapUrl()`
3. Tambahkan tombol di `Sidebar.tsx`

## Lisensi

Project ini dibuat untuk keperluan akademik dan pengembangan WebGIS Semarang Barat.

## Kontribusi

Data GeoJSON akan diberikan oleh tim dari jurusan Perencanaan Tata Ruang (PTRP) dan Perencanaan Wilayah dan Kota (PWK).

---

**Dibuat dengan ❤️ untuk WebGIS Semarang Barat**
