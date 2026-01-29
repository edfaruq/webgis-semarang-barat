# Folder Dokumen

Folder ini berisi dokumen-dokumen yang dapat diunduh melalui modal "Cari Data" di aplikasi.

## Struktur Folder

```
documents/
├── hukum/          # Dokumen hukum (Peraturan, SK, dll)
└── ekonomi/        # Dokumen ekonomi (Rencana, Laporan, dll)
```

## Format File

Dokumen dapat berupa:
- PDF (`.pdf`) - **Disarankan**
- Word (`.doc`, `.docx`)
- Excel (`.xls`, `.xlsx`)
- Format dokumen lainnya

## Cara Menambahkan Dokumen

1. **Simpan file dokumen** di folder yang sesuai:
   - Dokumen hukum → `documents/hukum/`
   - Dokumen ekonomi → `documents/ekonomi/`

2. **Update data di `components/SearchDataModal.tsx`**:
   - Tambahkan entry baru di `DOKUMEN_HUKUM` atau `DOKUMEN_EKONOMI`
   - Set `fileUrl` ke path relatif dari `public/`, contoh: `/documents/hukum/perda-penanggulangan-bencana.pdf`

## Contoh Struktur Data

```typescript
const DOKUMEN_HUKUM: DokumenItem[] = [
  { 
    id: "dh1", 
    title: "Peraturan Daerah tentang Penanggulangan Bencana", 
    subtitle: "Kecamatan Semarang Barat", 
    type: "dokumen", 
    category: "hukum",
    fileUrl: "/documents/hukum/perda-penanggulangan-bencana.pdf"
  },
  // ...
];
```

## Naming Convention

Gunakan nama file yang deskriptif dan konsisten:
- Gunakan huruf kecil
- Pisahkan kata dengan tanda hubung (`-`)
- Contoh: `perda-penanggulangan-bencana.pdf`, `sk-zona-rawan-bencana.pdf`
