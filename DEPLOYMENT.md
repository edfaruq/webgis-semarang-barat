# Deployment Guide - Railway

Panduan lengkap untuk deploy WebGIS Semarang Barat ke Railway.

## Prasyarat

1. Akun Railway (https://railway.app)
2. GitHub repository (atau Git provider lainnya)
3. Database MySQL (bisa menggunakan Railway MySQL service atau external)

## Langkah-langkah Deployment

### 1. Persiapan Repository

Pastikan semua perubahan sudah di-commit dan push ke repository:

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. Setup Railway Project

1. **Login ke Railway**: https://railway.app
2. **Create New Project** → **Deploy from GitHub repo**
3. Pilih repository `webgis-semarang-barat`
4. Railway akan otomatis detect Next.js dan mulai build

### 3. Setup Database MySQL

#### Opsi A: Menggunakan Railway MySQL (Recommended)

1. Di Railway dashboard, klik **+ New** → **Database** → **Add MySQL**
2. Railway akan otomatis membuat database MySQL
3. Copy **DATABASE_URL** dari database service (akan otomatis tersedia sebagai environment variable)

#### Opsi B: Menggunakan External MySQL

1. Setup MySQL di provider lain (contoh: PlanetScale, AWS RDS, dll)
2. Copy connection string MySQL Anda

### 4. Konfigurasi Environment Variables

Di Railway dashboard, buka project → **Variables** tab, tambahkan:

```env
# Database (wajib)
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE

# Session Secret (wajib - generate random string)
SESSION_SECRET=your-long-random-secret-string-here-minimum-32-characters

# Node Environment (opsional, Railway biasanya set otomatis)
NODE_ENV=production

# Optional: Admin credentials untuk seed
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

**Cara generate SESSION_SECRET:**
```bash
# Di terminal lokal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Setup Database Schema

Setelah deployment pertama berhasil, jalankan migration database:

**Opsi 1: Via Railway CLI (Recommended)**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link ke project
railway link

# Push schema ke database
railway run npx prisma db push

# (Optional) Seed admin user
railway run npm run db:seed
```

**Opsi 2: Via Railway Dashboard**

1. Buka project di Railway dashboard
2. Klik pada service → **Settings** → **Deploy**
3. Tambahkan **Deploy Command**: `npx prisma db push && npm start`
4. Atau gunakan **One-Click Deploy** dengan custom command

**Opsi 3: Via Railway Shell**

1. Di Railway dashboard, buka service → **Deployments** → **View Logs**
2. Klik **Shell** untuk akses terminal
3. Jalankan:
   ```bash
   npx prisma db push
   npm run db:seed  # Optional
   ```

### 6. Build & Deploy

Railway akan otomatis:
1. Detect Next.js dari `package.json`
2. Install dependencies (`npm install`)
3. Run `postinstall` script (generate Prisma client + compress images)
4. Run `build` command (`prisma generate && next build`)
5. Run `start` command (`npm start`)

### 7. Setup Custom Domain (Opsional)

1. Di Railway dashboard → **Settings** → **Networking**
2. Klik **Generate Domain** untuk mendapatkan Railway domain gratis
3. Atau **Add Custom Domain** untuk domain sendiri
4. Setup DNS records sesuai instruksi Railway

## Troubleshooting

### Build Fails: "Prisma Client not generated"

**Solusi:**
- Pastikan `DATABASE_URL` sudah di-set di Railway Variables
- Pastikan `postinstall` script berjalan (cek build logs)
- Jika masih error, tambahkan manual di build command:
  ```
  prisma generate && npm run build
  ```

### Build Fails: "Cannot find module 'sharp'"

**Solusi:**
- Pastikan `sharp` ada di `devDependencies` (sudah ada)
- Railway akan install semua dependencies termasuk devDependencies saat build
- Jika masih error, cek build logs untuk detail

### Runtime Error: "Database connection failed"

**Solusi:**
1. Pastikan `DATABASE_URL` sudah benar di Railway Variables
2. Pastikan database sudah dibuat dan accessible
3. Pastikan schema sudah di-push (`npx prisma db push`)
4. Cek database credentials dan network access

### Runtime Error: "Table 'Report' does not exist"

**Solusi:**
- Schema belum di-push ke database
- Jalankan: `railway run npx prisma db push`
- Atau via Railway Shell: `npx prisma db push`

### Images tidak muncul / 404

**Solusi:**
- Pastikan folder `public/images/peta/thumbnails/` sudah di-commit ke Git
- Railway akan serve static files dari folder `public/`
- Cek apakah file thumbnail sudah ada di repository

### Upload foto tidak berfungsi

**Solusi:**
- Pastikan folder `public/uploads/reports/` bisa di-write
- Railway menggunakan ephemeral filesystem, jadi upload akan hilang saat redeploy
- **Rekomendasi**: Gunakan external storage (AWS S3, Cloudinary, dll) untuk production

## Production Checklist

- [ ] Environment variables sudah di-set di Railway
- [ ] `DATABASE_URL` sudah benar dan database accessible
- [ ] `SESSION_SECRET` sudah di-generate (random string panjang)
- [ ] Database schema sudah di-push (`npx prisma db push`)
- [ ] Admin user sudah di-seed (opsional, bisa via Railway Shell)
- [ ] Build berhasil tanpa error
- [ ] Application berjalan di Railway domain
- [ ] Test submit lapor bencana berfungsi
- [ ] Test download peta/dokumen berfungsi
- [ ] Custom domain sudah di-setup (jika diperlukan)

## Monitoring & Logs

- **View Logs**: Railway dashboard → Service → **Deployments** → **View Logs**
- **Metrics**: Railway dashboard → Service → **Metrics** (CPU, Memory, Network)
- **Alerts**: Setup alerts di Railway untuk monitoring

## Cost Estimation

Railway menggunakan pay-as-you-go pricing:
- **Hobby Plan**: $5/month untuk $5 credit
- **Pro Plan**: $20/month untuk $20 credit
- Next.js app biasanya menggunakan ~512MB RAM
- Database MySQL: ~$5-10/month tergantung size

**Tips untuk mengurangi cost:**
- Gunakan Railway MySQL (lebih murah)
- Monitor resource usage
- Setup auto-sleep untuk development environment

## Update Deployment

Setiap kali push ke repository, Railway akan otomatis:
1. Detect changes
2. Trigger new build
3. Deploy new version

Atau bisa trigger manual via Railway dashboard → **Deployments** → **Redeploy**

## Rollback

Jika deployment baru bermasalah:
1. Railway dashboard → **Deployments**
2. Pilih deployment sebelumnya yang stable
3. Klik **Promote** untuk rollback ke versi tersebut

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app
