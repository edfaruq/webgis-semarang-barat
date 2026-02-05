# Setup Photo Storage untuk Railway

Railway menggunakan **ephemeral filesystem**, jadi file upload akan hilang saat redeploy. Berikut solusinya:

## 🎯 Solusi: Railway Volume (Persistent Storage)

### Opsi 1: Setup Railway Volume (Recommended untuk Production)

1. **Buat Volume di Railway:**
   - Railway Dashboard → Project → **+ New** → **Volume**
   - Name: `uploads-volume`
   - Size: 1GB (atau sesuai kebutuhan)

2. **Attach Volume ke Service:**
   - Railway Dashboard → Service → **Settings** → **Volumes**
   - Attach volume `uploads-volume`
   - Mount Path: `/data`

3. **Set Environment Variable:**
   ```bash
   railway variables set RAILWAY_VOLUME_MOUNT_PATH=/data
   ```

4. **Redeploy Service:**
   - Railway akan mount volume ke `/data`
   - Foto akan tersimpan di `/data/uploads/reports/`
   - Foto akan persist meskipun redeploy

### Opsi 2: External Storage (Cloudinary/Uploadcare) - Untuk Production Skala Besar

Untuk production yang lebih scalable, gunakan external storage:

#### Cloudinary (Recommended)

1. **Daftar Cloudinary:** https://cloudinary.com
2. **Install SDK:**
   ```bash
   npm install cloudinary
   ```
3. **Set Environment Variables:**
   ```bash
   railway variables set CLOUDINARY_CLOUD_NAME=your-cloud-name
   railway variables set CLOUDINARY_API_KEY=your-api-key
   railway variables set CLOUDINARY_API_SECRET=your-api-secret
   ```
4. **Update `app/actions/report.ts`** untuk upload ke Cloudinary

#### Uploadcare (Alternatif)

1. **Daftar Uploadcare:** https://uploadcare.com
2. **Install SDK:**
   ```bash
   npm install @uploadcare/upload-client
   ```
3. **Set Environment Variables:**
   ```bash
   railway variables set UPLOADCARE_PUBLIC_KEY=your-public-key
   railway variables set UPLOADCARE_SECRET_KEY=your-secret-key
   ```

## 📝 Current Implementation

Saat ini aplikasi sudah support:
- ✅ Railway Volume (jika `RAILWAY_VOLUME_MOUNT_PATH` di-set)
- ✅ Public folder fallback (untuk development)
- ✅ API route untuk serve files dari volume (`/api/uploads/reports/[filename]`)

## 🔧 Quick Setup (Railway Volume)

```bash
# 1. Set volume mount path
railway variables set RAILWAY_VOLUME_MOUNT_PATH=/data

# 2. Redeploy service
# Railway Dashboard → Service → Redeploy
```

## ✅ Verifikasi

Setelah setup volume:

1. **Test upload foto:**
   - Submit lapor bencana dengan foto
   - Cek Railway logs untuk "Photo saved successfully"

2. **Cek file di volume:**
   ```bash
   railway shell
   ls -la /data/uploads/reports/
   ```

3. **Test view foto:**
   - Login admin
   - Klik "Lihat Foto" pada laporan
   - Foto seharusnya muncul

## 🐛 Troubleshooting

### Foto tidak muncul setelah upload

1. **Cek Railway logs:**
   - Cari "Error saving photo" atau "Photo saved successfully"
   - Pastikan tidak ada error saat save

2. **Cek volume mount:**
   ```bash
   railway shell
   ls -la /data/uploads/reports/
   ```
   Jika folder tidak ada, volume mungkin tidak ter-mount dengan benar.

3. **Cek environment variable:**
   ```bash
   railway variables
   ```
   Pastikan `RAILWAY_VOLUME_MOUNT_PATH=/data` sudah di-set.

4. **Cek API route:**
   - Buka: `https://your-domain.railway.app/api/uploads/reports/[filename]`
   - Harus return image, bukan 404

### Foto hilang setelah redeploy

- Pastikan volume sudah di-attach ke service
- Pastikan `RAILWAY_VOLUME_MOUNT_PATH` sudah di-set
- Cek volume masih attached setelah redeploy

## 💰 Cost Estimation

- **Railway Volume:** ~$0.10/GB/month
- **Cloudinary:** Free tier 25GB storage, 25GB bandwidth/month
- **Uploadcare:** Free tier 3GB storage, 3GB bandwidth/month

## 🚀 Recommended untuk Production

Untuk production, gunakan **Cloudinary** atau **Uploadcare** karena:
- ✅ Lebih reliable
- ✅ CDN untuk fast loading
- ✅ Image optimization otomatis
- ✅ Free tier cukup untuk start

Untuk sekarang, Railway Volume sudah cukup untuk kebutuhan awal.
