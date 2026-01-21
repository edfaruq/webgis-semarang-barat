# Struktur Komponen - Panduan Tim KKN

## 🎯 Tujuan

Memecah `MapComponent.tsx` menjadi komponen layer terpisah agar setiap anggota tim bisa bekerja tanpa konflik saat merge.

## 📁 Struktur Komponen

```
components/Map/
├── MapComponent.tsx          # Komponen utama (jarang diubah)
├── MapControls.tsx           # Kontrol peta (shared)
├── UserLocationMarker.tsx   # Marker lokasi user (shared)
└── layers/                   # Layer terpisah per bencana
    ├── FloodLayer.tsx        # 👤 Farhan - Edit di sini
    ├── LandslideLayer.tsx   # 👤 Faruq - Edit di sini
    ├── LahanKritisLayer.tsx # 👤 Shaqi - Edit di sini
    └── README.md            # Dokumentasi layers
```

## 👥 Pembagian File

| Anggota | File Layer | Data Path | Edit Di |
|---------|-----------|-----------|---------|
| **Farhan** | `FloodLayer.tsx` | `public/data/disasters/banjir/` | ✅ `components/Map/layers/FloodLayer.tsx` |
| **Faruq** | `LandslideLayer.tsx` | `public/data/disasters/longsor/` | ✅ `components/Map/layers/LandslideLayer.tsx` |
| **Shaqi** | `LahanKritisLayer.tsx` | `public/data/disasters/lahan-kritis/` | ✅ `components/Map/layers/LahanKritisLayer.tsx` |

## ✅ Keuntungan Struktur Ini

### 1. **Tidak Konflik saat Merge**
- Setiap anggota hanya edit file layer mereka sendiri
- Git merge tidak akan konflik karena file berbeda
- Bisa develop paralel tanpa masalah

### 2. **Mudah Ditemukan**
- Kode layer terorganisir per bencana
- Jelas siapa yang bertanggung jawab untuk apa
- Dokumentasi ada di setiap file

### 3. **Independent Development**
- Bisa develop dan test layer sendiri
- Tidak perlu menunggu anggota lain
- Bisa commit dan push tanpa ganggu yang lain

### 4. **Scalable**
- Mudah menambah layer baru (drainase, pompa air, dll)
- Cukup buat file baru di folder `layers/`
- Import di `MapComponent.tsx`

## 📝 Cara Mengedit Layer

### Untuk Anggota Tim yang Sudah Ada

1. **Buka file layer Anda**
   - Farhan: `components/Map/layers/FloodLayer.tsx`
   - Faruq: `components/Map/layers/LandslideLayer.tsx`
   - Shaqi: `components/Map/layers/LahanKritisLayer.tsx`

2. **Edit sesuai kebutuhan**
   - Styling (warna, opacity, dll)
   - Popup content
   - Event handlers (hover, click, dll)
   - Logic layer

3. **Test di browser**
   - Refresh halaman
   - Toggle layer di sidebar
   - Cek apakah perubahan muncul

4. **Commit dan push**
   - Tidak akan konflik dengan anggota lain

### Contoh: Farhan Mengubah Warna Layer Banjir

Edit `components/Map/layers/FloodLayer.tsx`:

```typescript
const colors = {
  4: "#ff0000", // Ubah dari biru menjadi merah
  3: "#ff8800", // Ubah dari biru menjadi oranye
  // ... dst
};
```

Save → Refresh browser → Done! ✅

## 🆕 Menambah Layer Baru

### Contoh: Menambah Layer Drainase

1. **Buat file layer baru**
   ```bash
   # Buat file: components/Map/layers/DrainaseLayer.tsx
   ```

2. **Copy template dari layer yang ada**
   ```typescript
   import { GeoJSON } from "react-leaflet";
   import { GeoJSONCollection } from "@/types/geojson";
   
   interface DrainaseLayerProps {
     data: GeoJSONCollection | null;
     show: boolean;
   }
   
   export default function DrainaseLayer({ data, show }: DrainaseLayerProps) {
     if (!show || !data) return null;
     
     const drainaseStyle = (feature: any) => {
       return {
         color: "#0066cc",
         weight: 3,
         opacity: 0.8,
       };
     };
     
     return (
       <GeoJSON
         data={data}
         style={drainaseStyle}
         onEachFeature={(feature, layer) => {
           layer.bindPopup(`<div>Drainase: ${feature.properties?.nama}</div>`);
         }}
       />
     );
   }
   ```

3. **Import di MapComponent.tsx**
   ```typescript
   import DrainaseLayer from "./layers/DrainaseLayer";
   ```

4. **Gunakan di MapComponent**
   ```typescript
   <DrainaseLayer data={drainaseData} show={showDrainase} />
   ```

5. **Load data di app/page.tsx**
   ```typescript
   const drainase = await loadGeoJSON("/data/utilities/drainase/drainase-data.geojson");
   setDrainaseData(drainase);
   ```

## 🔄 Workflow Tim

### Saat Bekerja Bersama

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Bekerja di file layer Anda**
   - Edit hanya file layer Anda sendiri
   - Jangan edit file layer anggota lain

3. **Test di browser**
   - Pastikan perubahan berfungsi
   - Cek tidak ada error di console

4. **Commit dan push**
   ```bash
   git add components/Map/layers/FloodLayer.tsx  # File Anda saja
   git commit -m "Update flood layer styling"
   git push origin main
   ```

### Tidak Akan Konflik!

Karena setiap anggota edit file berbeda:
- ✅ Farhan edit `FloodLayer.tsx` → Tidak konflik
- ✅ Faruq edit `LandslideLayer.tsx` → Tidak konflik
- ✅ Shaqi edit `LahanKritisLayer.tsx` → Tidak konflik

## 🚨 Penting!

### ❌ Jangan Lakukan:
- Edit file layer anggota lain tanpa koordinasi
- Hapus file layer yang bukan milik Anda
- Edit `MapComponent.tsx` tanpa alasan jelas (shared file)

### ✅ Lakukan:
- Edit hanya file layer Anda sendiri
- Test di browser setelah perubahan
- Update dokumentasi jika menambah fitur baru
- Koordinasi jika perlu akses file anggota lain

## 📚 File yang Bisa Diubah vs Tidak

### ✅ Bisa Diubah (File Anda)
- `components/Map/layers/FloodLayer.tsx` (Farhan)
- `components/Map/layers/LandslideLayer.tsx` (Faruq)
- `components/Map/layers/LahanKritisLayer.tsx` (Shaqi)
- `public/data/disasters/[folder-anda]/` (Data Anda)

### ⚠️ Hati-hati (Shared Files)
- `components/Map/MapComponent.tsx` - Hanya untuk import layer baru
- `app/page.tsx` - Hanya untuk load data baru
- `components/Sidebar.tsx` - Hanya untuk toggle layer baru

### ❌ Jangan Diubah
- File layer anggota lain
- File konfigurasi (package.json, tsconfig.json, dll)
- File dokumentasi anggota lain

## 🎓 Contoh Skenario

### Skenario 1: Farhan Ingin Mengubah Popup Banjir

1. Buka `components/Map/layers/FloodLayer.tsx`
2. Edit bagian `layer.bindPopup(...)`
3. Save dan test
4. Commit dan push
5. ✅ Tidak konflik dengan anggota lain

### Skenario 2: Faruq Ingin Menambah Hover Effect

1. Buka `components/Map/layers/LandslideLayer.tsx`
2. Tambahkan `layer.on({ mouseover: ..., mouseout: ... })`
3. Save dan test
4. Commit dan push
5. ✅ Tidak konflik dengan anggota lain

### Skenario 3: Shaqi Ingin Mengubah Warna Lahan Kritis

1. Buka `components/Map/layers/LahanKritisLayer.tsx`
2. Edit `colors` object
3. Save dan test
4. Commit dan push
5. ✅ Tidak konflik dengan anggota lain

## 📖 Dokumentasi Lengkap

- **Layers**: `components/Map/layers/README.md`
- **Data Structure**: `public/data/DATA_STRUCTURE.md`
- **Main README**: `README.md`

## 🆘 Troubleshooting

### Layer tidak muncul?
- Cek data sudah di-load di `app/page.tsx`
- Cek `show` prop sudah `true`
- Cek console browser untuk error

### Styling tidak berubah?
- Hard refresh browser (Ctrl+Shift+R)
- Cek tidak ada typo di kode
- Cek console untuk error

### Konflik saat merge?
- Pastikan edit file layer Anda sendiri
- Pull latest changes sebelum push
- Koordinasi dengan anggota lain jika perlu
