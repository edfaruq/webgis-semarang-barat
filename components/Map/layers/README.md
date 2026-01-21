# Map Layers - Komponen Terpisah untuk Tim

Folder ini berisi komponen layer terpisah untuk setiap bencana/utilitas. Setiap anggota tim memiliki file sendiri untuk menghindari konflik saat merge.

## 📁 Struktur

```
layers/
├── FloodLayer.tsx          # 👤 Farhan - Layer banjir
├── LandslideLayer.tsx      # 👤 Faruq - Layer longsor
├── LahanKritisLayer.tsx    # 👤 Shaqi - Layer lahan kritis
├── BoundaryLayer.tsx       # 👤 Shared - Layer batas wilayah (infrastructure)
├── FacilitiesLayer.tsx     # 👤 Shared - Layer fasilitas (infrastructure)
└── README.md               # Dokumentasi ini
```

## 👥 Pembagian File

| Anggota | File | Data Path |
|---------|------|-----------|
| **Farhan** | `FloodLayer.tsx` | `public/data/disasters/banjir/` |
| **Faruq** | `LandslideLayer.tsx` | `public/data/disasters/longsor/` |
| **Shaqi** | `LahanKritisLayer.tsx` | `public/data/disasters/lahan-kritis/` |
| **Shared** | `BoundaryLayer.tsx` | `public/data/infrastructure/boundary.geojson` |
| **Shared** | `FacilitiesLayer.tsx` | `public/data/infrastructure/facilities.geojson` |

## ✅ Keuntungan

1. **Tidak Konflik**: Setiap anggota hanya edit file layer mereka sendiri
2. **Mudah Ditemukan**: Kode layer terorganisir per bencana
3. **Independent**: Bisa develop dan test layer sendiri tanpa ganggu yang lain
4. **Clear Ownership**: Jelas siapa yang bertanggung jawab untuk layer apa

## 📝 Cara Mengedit Layer

### Untuk Anggota Tim yang Sudah Ada

1. **Buka file layer Anda** (misal: `FloodLayer.tsx` untuk Farhan)
2. **Edit styling, popup, atau behavior** sesuai kebutuhan
3. **Test di browser** untuk memastikan perubahan berfungsi
4. **Commit dan push** perubahan Anda

### Menambah Layer Baru (Drainase, Pompa Air, dll)

1. **Buat file layer baru** di folder `layers/`
   ```typescript
   // DrainaseLayer.tsx
   import { GeoJSON } from "react-leaflet";
   import { GeoJSONCollection } from "@/types/geojson";
   
   interface DrainaseLayerProps {
     data: GeoJSONCollection | null;
     show: boolean;
   }
   
   export default function DrainaseLayer({ data, show }: DrainaseLayerProps) {
     if (!show || !data) return null;
     
     // Styling dan logic layer di sini
     return <GeoJSON data={data} style={...} />;
   }
   ```

2. **Import di MapComponent.tsx**
   ```typescript
   import DrainaseLayer from "./layers/DrainaseLayer";
   ```

3. **Gunakan di MapComponent**
   ```typescript
   <DrainaseLayer data={drainaseData} show={showDrainase} />
   ```

## 🎨 Struktur Komponen Layer

Setiap layer component harus:

1. **Menerima props**:
   - `data: GeoJSONCollection | null` - Data GeoJSON
   - `show: boolean` - Flag untuk show/hide layer

2. **Return null** jika `!show || !data`

3. **Render GeoJSON** dengan styling dan event handlers

4. **Dokumentasi** di header file:
   - Owner (siapa yang bertanggung jawab)
   - Data path (di mana file GeoJSON-nya)
   - Deskripsi singkat

## 🚨 Penting!

- **Jangan edit file layer anggota lain** tanpa koordinasi
- **Jangan hapus file layer** yang bukan milik Anda
- **Test di browser** setelah mengubah layer
- **Update dokumentasi** jika menambah fitur baru

## 📚 Contoh Edit

### Mengubah Warna Layer Banjir (Farhan)

Edit `FloodLayer.tsx`:

```typescript
const colors = {
  4: "#ff0000", // Ubah warna sangat tinggi menjadi merah
  3: "#ff8800", // Ubah warna tinggi menjadi oranye
  // ... dst
};
```

### Menambah Popup Info (Faruq)

Edit `LandslideLayer.tsx`:

```typescript
layer.bindPopup(`
  <div>
    <h3>Area Rawan Longsor</h3>
    <p>Tingkat: ${props.tingkat_kerawanan}</p>
    <p>Info tambahan: ${props.info_tambahan}</p> {/* Tambahan */}
  </div>
`);
```

## 🔄 Workflow

1. **Pull latest changes** dari git
2. **Edit file layer Anda** (tidak akan konflik dengan anggota lain)
3. **Test di browser**
4. **Commit dan push** perubahan
