# Struktur Data GeoJSON - Panduan Tim KKN

## 📁 Struktur Folder

```
public/data/
├── infrastructure/          # Data infrastruktur dasar (shared)
│   ├── boundary.geojson    # Batas wilayah
│   └── facilities.geojson  # Fasilitas umum
│
├── disasters/              # Data bencana (setiap anggota punya folder sendiri)
│   ├── banjir/             # 👤 Farhan
│   │   ├── Bahaya-Banjir-KKNT.geojson
│   │   └── flood-risk.geojson
│   ├── longsor/            # 👤 Faruq
│   │   └── landslide-risk.geojson
│   └── lahan-kritis/       # 👤 Shaqi
│       └── LahanKritis.geojson
│
├── routes/                 # Data rute (shared)
│   └── evacuation-route.geojson
│
└── utilities/              # Data utilitas (untuk masa depan)
    ├── drainase/
    └── pompa-air/
```

## 👥 Pembagian Tugas

| Anggota | Folder | Data yang Dikerjakan |
|---------|--------|---------------------|
| **Farhan** | `disasters/banjir/` | Data banjir, risiko banjir |
| **Faruq** | `disasters/longsor/` | Data longsor, risiko longsor |
| **Shaqi** | `disasters/lahan-kritis/` | Data lahan kritis |

## ✅ Keuntungan Struktur Ini

1. **Tidak Konflik**: Setiap anggota bekerja di folder sendiri
2. **Mudah Ditemukan**: Data terorganisir berdasarkan kategori
3. **Scalable**: Mudah menambah kategori baru (drainase, pompa air, dll)
4. **Clear Ownership**: Jelas siapa yang bertanggung jawab untuk data apa

## 📝 Cara Menambah Data Baru

### Untuk Anggota Tim yang Sudah Ada

1. **Buka folder Anda** (misal: `disasters/banjir/` untuk Farhan)
2. **Tambahkan file GeoJSON** di folder tersebut
3. **Update path di kode** (lihat bagian di bawah)

### Untuk Kategori Baru (Drainase, Pompa Air, dll)

1. **Buat folder baru** di `utilities/` atau kategori yang sesuai
   ```bash
   mkdir public/data/utilities/drainase
   ```

2. **Tambahkan file GeoJSON** di folder tersebut
   ```bash
   # Contoh: public/data/utilities/drainase/drainase-data.geojson
   ```

3. **Update kode** untuk load data baru:
   
   Edit `app/page.tsx`:
   ```typescript
   const [drainaseData, setDrainaseData] = useState<GeoJSONCollection | null>(null);
   
   // Di useEffect loadData:
   const drainase = await loadGeoJSON("/data/utilities/drainase/drainase-data.geojson").catch(() => null);
   setDrainaseData(drainase);
   ```

   Edit `components/Map/MapComponent.tsx`:
   ```typescript
   // Tambahkan prop
   drainaseData?: GeoJSONCollection | null;
   showDrainase?: boolean;
   
   // Tambahkan layer di map
   {showDrainase && drainaseData && (
     <GeoJSON data={drainaseData} style={drainaseStyle} />
   )}
   ```

   Edit `components/Sidebar.tsx`:
   ```typescript
   // Tambahkan toggle untuk layer baru
   <LayerToggle
     label="Drainase"
     checked={showDrainase}
     onChange={() => setShowDrainase(!showDrainase)}
   />
   ```

## 🔄 Workflow Tim

### Saat Bekerja Bersama

1. **Pull latest changes** dari git
2. **Bekerja di folder Anda sendiri** (tidak akan konflik)
3. **Commit dan push** perubahan Anda
4. **Jika perlu data dari anggota lain**, load dari folder mereka

### Contoh: Farhan butuh data longsor

```typescript
// Di app/page.tsx, Farhan bisa load data longsor juga
const landslideRisk = await loadGeoJSON("/data/disasters/longsor/landslide-risk.geojson");
```

## 📋 Checklist Saat Menambah Data

- [ ] File GeoJSON valid (cek di geojson.io)
- [ ] File ada di folder yang benar
- [ ] Path di kode sudah diupdate
- [ ] Layer muncul di map (jika perlu)
- [ ] Toggle di sidebar sudah ditambahkan (jika perlu)
- [ ] Styling sudah sesuai (jika perlu)
- [ ] Dokumentasi di README folder sudah diupdate

## 🚨 Penting!

- **Jangan edit file di folder anggota lain** tanpa koordinasi
- **Jangan hapus folder** yang bukan milik Anda
- **Pastikan format GeoJSON valid** sebelum commit
- **Test di browser** setelah menambah data baru

## 📚 Format GeoJSON

Semua file harus dalam format GeoJSON FeatureCollection:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        // Properties sesuai kebutuhan
      },
      "geometry": {
        "type": "Polygon", // atau Point, LineString, dll
        "coordinates": [[[lng, lat], ...]]
      }
    }
  ]
}
```

## 🆘 Troubleshooting

### Data tidak muncul di map?
- Cek path di kode sudah benar
- Cek file GeoJSON valid
- Cek console browser untuk error
- Pastikan layer toggle sudah diaktifkan

### Konflik saat merge?
- Pastikan bekerja di folder sendiri
- Jika konflik, koordinasi dengan anggota yang punya folder tersebut

### Ingin menambah kategori baru?
- Buat folder di kategori yang sesuai
- Update dokumentasi ini
- Update path di kode
