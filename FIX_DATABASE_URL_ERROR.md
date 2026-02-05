# Fix DATABASE_URL Error

Error: `Environment variable not found: DATABASE_URL`

## ✅ Status
- ✅ `DATABASE_URL` sudah di-set di Railway Variables
- ✅ Prisma schema sudah benar (`provider = "mysql"`)
- ✅ Prisma client sudah di-generate

## 🔧 Solusi: Rebuild Aplikasi

Masalahnya adalah build cache. Aplikasi perlu di-rebuild setelah perubahan:

### Opsi 1: Via Railway Dashboard (Recommended)

1. Railway Dashboard → Service → **Settings**
2. Scroll ke bawah → **Deploy**
3. Klik **Redeploy** atau **Clear Build Cache** → **Redeploy**

### Opsi 2: Via Railway CLI

```bash
# Trigger rebuild dengan commit baru
git commit --allow-empty -m "Trigger Railway rebuild"
git push origin main
```

### Opsi 3: Manual Rebuild via Railway Shell

1. Railway Dashboard → Service → Deployments → **Shell**
2. Jalankan:
   ```bash
   npm run build
   ```

## 📝 Verifikasi

Setelah rebuild, test:

```bash
# Test Prisma connection
railway run npx prisma db push --skip-generate

# Test login flow
railway run node scripts/test-login.mjs
```

## 🐛 Jika Masih Error

1. **Cek Railway Variables:**
   ```bash
   railway variables
   ```
   Pastikan `DATABASE_URL` muncul dan benar.

2. **Regenerate Prisma Client:**
   ```bash
   railway run npx prisma generate
   ```

3. **Clear Build Cache & Rebuild:**
   - Railway Dashboard → Settings → Clear Build Cache
   - Redeploy

4. **Check Build Logs:**
   Railway Dashboard → Deployments → **Build Logs**
   - Cari error terkait Prisma
   - Pastikan `DATABASE_URL` ter-load saat build

## ✅ Expected Result

Setelah rebuild, error `Environment variable not found: DATABASE_URL` seharusnya hilang dan login berfungsi.
