# Panduan Instalasi Cepat

## Langkah-langkah Instalasi

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Jalankan Development Server**
   ```bash
   npm run dev
   ```

3. **Buka Browser**
   ```
   http://localhost:3000
   ```

## Troubleshooting

### Error: Cannot find module 'react-leaflet'
- Pastikan sudah menjalankan `npm install`
- Hapus `node_modules` dan `package-lock.json`, lalu jalankan `npm install` lagi

### Peta tidak muncul
- Pastikan browser console tidak ada error
- Cek apakah file GeoJSON ada di `public/data/`
- Pastikan Leaflet CSS ter-load (cek Network tab di DevTools)

### Marker tidak muncul
- Pastikan `leaflet-defaulticon-compatibility` ter-install
- Cek console untuk error terkait icon path

## Build untuk Production

```bash
npm run build
npm start
```

## Mengganti Data

1. Ganti file `public/data/boundary.geojson` dengan data batas wilayah Anda
2. Ganti file `public/data/facilities.geojson` dengan data fasilitas Anda
3. Pastikan format GeoJSON valid
4. Refresh browser

## Catatan untuk Laragon

Jika menggunakan Laragon, pastikan:
- Node.js sudah ter-install dan terdeteksi
- Port 3000 tidak digunakan aplikasi lain
- Firewall tidak memblokir port 3000
