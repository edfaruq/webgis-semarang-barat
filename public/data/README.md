# Struktur Data GeoJSON

Struktur folder ini diorganisir berdasarkan kategori untuk memudahkan kolaborasi tim.

## Struktur Folder

```
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
```

## Pembagian Tugas Tim

- **Farhan**: `disasters/banjir/`
- **Faruq**: `disasters/longsor/`
- **Shaqi**: `disasters/lahan-kritis/`

## Menambah Data Baru

1. Buat folder baru di kategori yang sesuai
2. Tambahkan file GeoJSON di folder tersebut
3. Update path di `app/page.tsx` dan `app/kelurahan/[slug]/page.tsx`
4. Update komponen Map jika perlu styling khusus

## Format File

Semua file harus dalam format GeoJSON FeatureCollection yang valid.
