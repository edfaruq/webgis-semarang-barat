# Jalur Evakuasi

Folder ini berisi data jalur evakuasi dalam format GeoJSON.

## File

- `evacuation-route.geojson` - Data jalur evakuasi yang sudah digabungkan dari 9 file terpisah

## Struktur Data

Setiap feature memiliki properties:
- `id`: ID unik jalur
- `nama`: Nama jalur evakuasi
- `deskripsi`: Deskripsi jalur
- `prioritas`: Tingkat prioritas (tinggi/sedang/rendah)
- `kelurahan`: Slug kelurahan
- `slug_kelurahan`: Slug kelurahan
- `nama_kelurahan`: Nama kelurahan

## Geometry

- `LineString`: Untuk jalur sederhana
- `MultiLineString`: Untuk jalur yang terdiri dari beberapa segmen

## Koordinat

Semua koordinat dalam format WGS84 (lng, lat).
