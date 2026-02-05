# Setup Railway Volume untuk Photo Storage

## 🎯 Masalah

Railway menggunakan **ephemeral filesystem**, jadi file upload ke `public/uploads/` akan hilang saat redeploy atau restart.

## ✅ Solusi: Railway Volume

Railway Volume adalah persistent storage yang tidak hilang saat redeploy.

## 📋 Langkah Setup

### 1. Buat Volume di Railway

1. Buka Railway Dashboard → Project Anda
2. Klik **+ New** → **Volume**
3. Isi:
   - **Name:** `uploads-volume`
   - **Size:** `1 GB` (atau sesuai kebutuhan)
4. Klik **Create**

### 2. Attach Volume ke Service

1. Railway Dashboard → Service (webgis-semarang-barat)
2. Klik **Settings** tab
3. Scroll ke bagian **Volumes**
4. Klik **+ Attach Volume**
5. Pilih volume `uploads-volume`
6. **Mount Path:** `/data`
7. Klik **Attach**

### 3. Set Environment Variable

```bash
railway variables set RAILWAY_VOLUME_MOUNT_PATH=/data
```

Atau via Railway Dashboard:
- Service → **Variables** tab
- Add variable:
  - Key: `RAILWAY_VOLUME_MOUNT_PATH`
  - Value: `/data`

### 4. Redeploy Service

1. Railway Dashboard → Service → **Settings** → **Deploy**
2. Klik **Redeploy**

Atau trigger via Git:
```bash
git commit --allow-empty -m "Setup Railway Volume"
git push origin main
```

## ✅ Verifikasi

### 1. Test Upload Foto

1. Buka aplikasi di Railway domain
2. Submit lapor bencana dengan foto
3. Cek Railway logs untuk "Photo saved successfully"

### 2. Cek File di Volume

```bash
railway shell
ls -la /data/uploads/reports/
```

Seharusnya ada file foto yang baru di-upload.

### 3. Test View Foto

1. Login admin
2. Buka Admin Console
3. Klik "Lihat Foto" pada laporan yang baru
4. Foto seharusnya muncul

## 🔍 Troubleshooting

### Foto tidak muncul setelah upload

1. **Cek Railway logs:**
   ```
   Railway Dashboard → Service → Deployments → View Logs
   ```
   Cari:
   - "Photo saved successfully" ✅
   - "Error saving photo" ❌

2. **Cek volume mount:**
   ```bash
   railway shell
   ls -la /data/
   ```
   Jika folder tidak ada, volume mungkin tidak ter-mount.

3. **Cek environment variable:**
   ```bash
   railway variables
   ```
   Pastikan `RAILWAY_VOLUME_MOUNT_PATH=/data` ada.

4. **Cek API route:**
   Buka di browser:
   ```
   https://your-domain.railway.app/api/uploads/reports/[filename]
   ```
   Harus return image, bukan 404.

### Foto hilang setelah redeploy

- ✅ Volume sudah di-attach? (Settings → Volumes)
- ✅ `RAILWAY_VOLUME_MOUNT_PATH` sudah di-set?
- ✅ Volume masih attached setelah redeploy?

### Error: "Cannot write to /data"

- Pastikan volume sudah di-attach dengan mount path `/data`
- Pastikan service memiliki permission untuk write ke volume
- Cek Railway logs untuk permission error

## 📝 Cara Kerja

1. **Upload foto:**
   - Foto disimpan ke `/data/uploads/reports/` (Railway Volume)
   - URL disimpan di database: `/api/uploads/reports/[filename]`

2. **View foto:**
   - Admin klik "Lihat Foto"
   - Browser request ke `/api/uploads/reports/[filename]`
   - API route membaca file dari `/data/uploads/reports/[filename]`
   - Return image dengan proper content-type

3. **Persistence:**
   - File di Railway Volume tidak hilang saat redeploy
   - File tetap ada meskipun service restart

## 💰 Cost

Railway Volume pricing:
- **$0.10 per GB per month**
- 1 GB = ~$0.10/month
- 10 GB = ~$1/month

Untuk start, 1 GB sudah cukup untuk ratusan foto.

## 🚀 Next Steps (Optional)

Untuk production skala besar, pertimbangkan:
- **Cloudinary** (Free tier: 25GB storage)
- **AWS S3** (Pay as you go)
- **Uploadcare** (Free tier: 3GB storage)

Tapi untuk sekarang, Railway Volume sudah cukup!
